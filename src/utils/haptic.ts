import { generateHapticFeedback } from '@apps-in-toss/web-framework';

export function haptic() {
  try {
    generateHapticFeedback({ type: 'softMedium' });
  } catch {
    // 토스 앱 외부 환경에서는 무시
  }
}
