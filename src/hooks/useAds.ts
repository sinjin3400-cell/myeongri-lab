import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TossAds,
  loadFullScreenAd,
  showFullScreenAd,
} from '@apps-in-toss/web-framework';
import type { TossAdsAttachBannerOptions } from '@apps-in-toss/web-framework';

export const AD_IDS = {
  REWARDED: 'ait.v2.live.6092731822e14b96',
  INTERSTITIAL: 'ait.v2.live.c3b604dbb2954ad5',
  BANNER: 'ait.v2.live.15a1f64067844a40',
} as const;

function safeIsSupported(fn: { isSupported: () => boolean }): boolean {
  try {
    return fn.isSupported();
  } catch {
    return false;
  }
}

// --- 배너 광고 훅 ---

export function useTossBanner() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    if (!safeIsSupported(TossAds.initialize)) return;

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

// --- 리워드/전면 광고 훅 ---

export function useInterstitialAd(adGroupId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const unregisterRef = useRef<(() => void) | null>(null);

  const loadAd = useCallback(() => {
    if (!safeIsSupported(loadFullScreenAd)) return;

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

  const showAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isLoaded || !safeIsSupported(showFullScreenAd)) {
        resolve(false);
        return;
      }

      let rewarded = false;

      showFullScreenAd({
        options: { adGroupId },
        onEvent: (event) => {
          if (event.type === 'userEarnedReward') {
            rewarded = true;
          }
          if (event.type === 'dismissed' || event.type === 'failedToShow') {
            setIsLoaded(false);
            loadAd();
            resolve(rewarded);
          }
        },
        onError: () => {
          setIsLoaded(false);
          loadAd();
          resolve(false);
        },
      });
    });
  }, [adGroupId, isLoaded, loadAd]);

  return { isLoaded, showAd };
}
