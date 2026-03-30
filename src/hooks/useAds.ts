import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
} from '@apps-in-toss/web-framework';
import type { TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';

// 테스트용 ID — 콘솔에서 발급받은 운영 ID로 교체 필요
export const AD_IDS = {
  INTERSTITIAL: 'ait-ad-test-interstitial-id',
  BANNER: 'ait-ad-test-banner-id',
} as const;

// --- 배너 광고 훅 ---

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    if (!TossAds.initialize.isSupported()) return;

    TossAds.initialize({
      callbacks: {
        onInitialized: () => setIsInitialized(true),
        onInitializationFailed: (error) => {
          console.error('Toss Ads SDK 초기화 실패:', error);
        },
      },
    });
  }, [isInitialized]);

  const attachBanner = useCallback(
    (adGroupId: string, element: HTMLElement, options?: TossAdsAttachBannerOptions) => {
      if (!isInitialized) return;
      return TossAds.attachBanner(adGroupId, element, options);
    },
    [isInitialized],
  );

  return { isInitialized, attachBanner };
}

// --- 전면 광고 훅 ---

export function useInterstitialAd(adGroupId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const unregisterRef = useRef<(() => void) | null>(null);

  const loadAd = useCallback(() => {
    if (!loadFullScreenAd.isSupported()) return;

    setIsLoaded(false);
    unregisterRef.current = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          setIsLoaded(true);
        }
      },
      onError: () => {
        setIsLoaded(false);
      },
    });
  }, [adGroupId]);

  useEffect(() => {
    loadAd();
    return () => {
      unregisterRef.current?.();
    };
  }, [loadAd]);

  const showAd = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!isLoaded || !showFullScreenAd.isSupported()) {
        resolve();
        return;
      }

      showFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === 'dismissed' || event.type === 'failedToShow') {
            setIsLoaded(false);
            loadAd(); // 다음 광고 미리 로드
            resolve();
          }
        },
        onError: () => {
          setIsLoaded(false);
          loadAd();
          resolve();
        },
      });
    });
  }, [adGroupId, isLoaded, loadAd]);

  return { isLoaded, showAd };
}
