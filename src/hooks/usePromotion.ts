import { useCallback, useRef } from 'react';
import { grantPromotionReward } from '@apps-in-toss/web-framework';

// 프로모션 코드 (앱인토스 콘솔에서 프로모션 승인 후 실제 코드로 교체 필요)
const PROMOTION_CODE = 'MYEONGRI_FORTUNE';

/**
 * 확률 기반 포인트 금액 결정
 * - 90%: 1~3원
 * - 9.9%: 5~7원
 * - 0.1%: 1,000원
 */
function getRewardAmount(): number {
  const rand = Math.random() * 100;

  if (rand < 0.1) {
    // 0.1% → 1,000원 (황금운세)
    return 1000;
  } else if (rand < 10) {
    // 9.9% → 5~7원
    return Math.floor(Math.random() * 3) + 5;
  } else {
    // 90% → 1~3원
    return Math.floor(Math.random() * 3) + 1;
  }
}

export function usePromotion() {
  const grantedRef = useRef(false);

  const grantReward = useCallback(async (): Promise<{
    success: boolean;
    amount: number;
    isGolden: boolean;
  }> => {
    // 세션당 1회만 지급
    if (grantedRef.current) {
      return { success: false, amount: 0, isGolden: false };
    }

    const amount = getRewardAmount();
    const isGolden = amount === 1000;

    try {
      const result = await grantPromotionReward({
        params: {
          promotionCode: PROMOTION_CODE,
          amount,
        },
      });

      if (!result) {
        console.warn('프로모션: 지원하지 않는 앱 버전');
        return { success: false, amount: 0, isGolden: false };
      }

      if (result === 'ERROR') {
        console.error('프로모션: 알 수 없는 오류');
        return { success: false, amount: 0, isGolden: false };
      }

      if ('key' in result) {
        grantedRef.current = true;
        return { success: true, amount, isGolden };
      }

      if ('errorCode' in result) {
        // 4113: 이미 지급됨 → 중복 방지
        if (result.errorCode === '4113') {
          grantedRef.current = true;
        }
        console.error('프로모션 실패:', result.errorCode, result.message);
        return { success: false, amount: 0, isGolden: false };
      }

      return { success: false, amount: 0, isGolden: false };
    } catch (err) {
      console.error('프로모션 오류:', err);
      return { success: false, amount: 0, isGolden: false };
    }
  }, []);

  return { grantReward };
}
