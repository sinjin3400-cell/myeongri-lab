import { useCallback, useEffect, useRef, useState } from 'react';
import { IAP, Analytics } from '@apps-in-toss/web-framework';
import type { IapProductListItem } from '@apps-in-toss/web-framework';
import { trackEvent } from '../utils/analytics';

function trackBoth(logName: string, params: Record<string, string | number | boolean> = {}) {
  try { Analytics.click({ log_name: logName, ...params }); } catch (_) { /* noop */ }
  trackEvent(logName, params);
}

export const SKU = {
  PASS_1: 'ait.0000024218.2d0d5485.3ffb04f070.6644349306',
  PASS_3: 'ait.0000024218.e3de3f71.482f1e81e1.6644422266',
  PASS_5: 'ait.0000024218.58d8a9b9.8ce5413f98.6644429046',
  PASS_10: 'ait.0000024218.f23e5db9.eb23243bb4.6644474476',
  GOLDEN_KEY: 'ait.0000024218.7dfc8fed.3e5d5b6e51.6649360039',
} as const;

export const SKU_TO_AMOUNT: Record<string, number> = {
  [SKU.PASS_1]: 1,
  [SKU.PASS_3]: 3,
  [SKU.PASS_5]: 5,
  [SKU.PASS_10]: 10,
};

export function useIAP() {
  const [products, setProducts] = useState<IapProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadProducts();
    restorePendingOrders();
    return () => { cleanupRef.current?.(); };
  }, []);

  async function loadProducts() {
    try {
      const res = await IAP.getProductItemList();
      if (res?.products) setProducts(res.products);
    } catch {
      // SDK 미지원 환경 (웹 브라우저 등)
    }
  }

  async function restorePendingOrders() {
    try {
      const res = await IAP.getPendingOrders();
      const pending = res?.orders;
      if (!pending?.length) return;
      for (const order of pending) {
        await IAP.completeProductGrant({ params: { orderId: order.orderId } });
        trackEvent('iap_pending_restored', { orderId: order.orderId });
      }
    } catch {
      // 미결 주문 없으면 무시
    }
  }

  const purchaseConsumable = useCallback((
    sku: string,
    onSuccess: (amount: number) => void,
    onError?: (err: unknown) => void,
  ) => {
    setLoading(true);
    const amount = SKU_TO_AMOUNT[sku] ?? 1;

    try {
      const cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku,
          processProductGrant: async ({ orderId }) => {
            trackEvent('iap_grant_processing', { sku, orderId });
            return true;
          },
        },
        onEvent: async (event) => {
          if (event.type === 'success') {
            trackBoth('iap_purchase_success', { sku, amount });
            onSuccess(amount);
          }
          setLoading(false);
          cleanupRef.current = null;
        },
        onError: (err) => {
          const code = (err as { code?: string })?.code;
          trackBoth('iap_purchase_error', { sku, error: code ?? 'unknown' });
          if (code !== 'USER_CANCELED') {
            onError?.(err);
          }
          setLoading(false);
          cleanupRef.current = null;
        },
      });
      cleanupRef.current = cleanup;
    } catch (err) {
      trackBoth('iap_purchase_init_error', { sku });
      onError?.(err);
      setLoading(false);
    }
  }, []);

  const purchaseGoldenKey = useCallback((
    onSuccess: () => void,
    onError?: (err: unknown) => void,
  ) => {
    if (!SKU.GOLDEN_KEY) {
      trackEvent('iap_golden_key_no_sku', {});
      onError?.(new Error('황금열쇠 상품이 아직 등록되지 않았습니다.'));
      return;
    }
    setLoading(true);
    try {
      const cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku: SKU.GOLDEN_KEY,
          processProductGrant: async ({ orderId }) => {
            trackEvent('iap_golden_key_grant', { orderId });
            return true;
          },
        },
        onEvent: async (event) => {
          if (event.type === 'success') {
            trackBoth('iap_golden_key_success');
            onSuccess();
          }
          setLoading(false);
          cleanupRef.current = null;
        },
        onError: (err) => {
          const code = (err as { code?: string })?.code;
          trackBoth('iap_golden_key_error', { error: code ?? 'unknown' });
          if (code !== 'USER_CANCELED') {
            onError?.(err);
          }
          setLoading(false);
          cleanupRef.current = null;
        },
      });
      cleanupRef.current = cleanup;
    } catch (err) {
      trackBoth('iap_golden_key_init_error');
      onError?.(err);
      setLoading(false);
    }
  }, []);

  return { products, loading, purchaseConsumable, purchaseGoldenKey };
}
