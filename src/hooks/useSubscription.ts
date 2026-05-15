import { useState, useCallback, useEffect } from 'react';
import { IAP } from '@apps-in-toss/web-framework';
import { trackEvent } from '../utils/analytics';
import { SKU } from './useIAP';

const STORAGE_KEY = 'golden_key_subscription';

export interface SubscriptionState {
  active: boolean;
  subscriptionId?: string;
  subscribedAt?: string;
}

function loadSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: false };
    return JSON.parse(raw);
  } catch {
    return { active: false };
  }
}

function saveSubscription(state: SubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState(loadSubscription);

  const isSubscribed = subscription.active;

  const activate = useCallback((subscriptionId: string) => {
    const state: SubscriptionState = {
      active: true,
      subscriptionId,
      subscribedAt: new Date().toISOString(),
    };
    saveSubscription(state);
    setSubscription(state);
    trackEvent('subscription_activated', { subscriptionId });
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSubscription({ active: false });
    trackEvent('subscription_deactivated', {});
  }, []);

  const verifyWithSdk = useCallback(async () => {
    try {
      const res = await IAP.getCompletedOrRefundedOrders();
      if (!res?.orders?.length) {
        if (subscription.active) deactivate();
        return;
      }

      const subOrders = res.orders.filter(o => o.sku === SKU.GOLDEN_KEY_SUB);
      const lastOrder = subOrders[0];

      if (!lastOrder || lastOrder.status === 'REFUNDED') {
        if (subscription.active) deactivate();
        return;
      }

      if (!subscription.active && lastOrder.status === 'COMPLETED') {
        activate(subscription.subscriptionId ?? `verified_${Date.now()}`);
      }
    } catch {
      // SDK 미지원 환경 — localStorage 상태 유지
    }
  }, [subscription.active, subscription.subscriptionId, activate, deactivate]);

  useEffect(() => {
    if (!SKU.GOLDEN_KEY_SUB.startsWith('PLACEHOLDER')) {
      verifyWithSdk();
    }
  }, [verifyWithSdk]);

  return { isSubscribed, subscription, activate, deactivate, verifyWithSdk };
}
