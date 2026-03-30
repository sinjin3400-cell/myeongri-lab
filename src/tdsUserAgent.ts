import type { ComponentProps } from 'react';
import type { TDSMobileProvider } from '@toss/tds-mobile';

type UA = ComponentProps<typeof TDSMobileProvider>['userAgent'];

/**
 * 브라우저·샌드박스 WebView에서 TDS에 넘기는 기본 UA 정보입니다.
 * 토스 앱 WebView에서는 네이티브 브릿지로 보강할 수 있어요.
 */
export function getDefaultUserAgent(): UA {
  if (typeof navigator === 'undefined') {
    return {
      fontA11y: undefined,
      fontScale: 1,
      isAndroid: false,
      isIOS: false,
    };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  return {
    fontA11y: undefined,
    fontScale: 1,
    isAndroid,
    isIOS,
  };
}
