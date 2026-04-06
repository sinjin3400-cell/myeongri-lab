/**
 * GA4 이벤트 추적 유틸리티
 * 측정 ID: G-R4WH1J5HRW
 */

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: [string, ...unknown[]]) => void;
  }
}

/** GA4 커스텀 이벤트 전송 */
export function trackEvent(eventName: string, params?: GtagParams) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/** 사용자 속성 설정 */
export function setUserProperties(props: GtagParams) {
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', props);
  }
}

// ── 단계 이동 이벤트 ──

export function trackStepView(step: string) {
  trackEvent('step_view', { step_name: step });
}

// ── InfoStep 이벤트 ──

export function trackFormSubmit(gender: string, hasSijin: boolean) {
  trackEvent('form_submitted', { gender, has_sijin: hasSijin });
}

// ── MbtiStep 이벤트 ──

export function trackMbtiSelected(mbtiType: string) {
  trackEvent('mbti_selected', { mbti_type: mbtiType });
}

export function trackMbtiSkipped() {
  trackEvent('mbti_skipped');
}

// ── LoadingStep 이벤트 ──

export function trackAnalysisStart(period: string, hasMbti: boolean) {
  trackEvent('analysis_start', { period, has_mbti: hasMbti });
}

export function trackAnalysisComplete(period: string, score: number, durationMs: number) {
  trackEvent('analysis_complete', { period, score, duration_ms: durationMs });
}

export function trackAnalysisError(errorMessage: string) {
  trackEvent('analysis_error', { error_message: errorMessage });
}

// ── ResultStep 이벤트 ──

export function trackFullFortuneClicked() {
  trackEvent('full_fortune_clicked');
}

export function trackFortuneCardExpanded(category: string) {
  trackEvent('fortune_card_expanded', { category });
}

export function trackPeriodChanged(fromPeriod: string, toPeriod: string) {
  trackEvent('period_changed', { from_period: fromPeriod, to_period: toPeriod });
}

export function trackTomorrowClicked() {
  trackEvent('tomorrow_clicked');
}

export function trackRestart() {
  trackEvent('app_restart');
}

export function trackRewardGranted(amount: number, isGolden: boolean) {
  trackEvent('reward_granted', { amount, is_golden: isGolden });
}

// ── 공유 이벤트 ──

export function trackShareButtonClicked() {
  trackEvent('share_button_clicked');
}

export function trackShareMethod(method: string) {
  trackEvent('share_initiated', { method });
}

// ── 광고 이벤트 ──

export function trackAdImpression(adType: string, location: string) {
  trackEvent('ad_impression', { ad_type: adType, ad_location: location });
}
