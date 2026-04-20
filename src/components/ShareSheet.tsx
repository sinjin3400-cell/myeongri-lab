import { useState, useCallback } from 'react';
import { trackShareMethod } from '../utils/analytics';
import { Analytics, contactsViral, setClipboardText } from '@apps-in-toss/web-framework';
import { Toast } from './Toast';

/**
 * 모든 결과 타입에서 사용 가능한 범용 공유 데이터.
 * 각 결과 페이지에서 자신의 데이터 → ShareInfo로 변환하여 전달.
 */
export type ShareInfo = {
  /** 공유 제목 (e.g., "경민님의 오늘 운세") */
  title: string;
  /** 한줄 요약 */
  summaryLine: string;
  /** 점수 (없으면 숨김) */
  score?: number;
  /** 공유 텍스트에 추가할 행운/추가 정보 (e.g., "행운색: 파란색 | 행운숫자: 7") */
  extraLine?: string;
  /** 서버에 저장할 공유 데이터 (FortuneResult용). 없으면 기본 URL만 공유 */
  serverData?: Record<string, unknown>;
};

type Props = {
  shareInfo: ShareInfo;
  onClose: () => void;
  onShareReward?: () => void;
};


const SHARE_REWARD_MODULE_ID = 'faa9cc68-4c06-4174-8303-1fa5b7250c1d';

/** 웹 fallback URL (서버 공유 데이터 저장용) */
const WEB_BASE_URL = 'https://myeongri-lab.vercel.app';
/** 클립보드에 텍스트 복사 (토스 API 우선 → navigator.clipboard → textarea fallback) */
async function copyToClipboard(text: string): Promise<void> {
  // 1) 토스 SDK setClipboardText
  try {
    await setClipboardText(text);
    return;
  } catch { /* 토스 외부 환경 → fallback */ }

  // 2) navigator.clipboard
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch { /* 보안 제한 → fallback */ }

  // 3) textarea fallback (legacy)
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function ShareSheet({ shareInfo, onClose, onShareReward }: Props) {
  const [viralLoading, setViralLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const { title, summaryLine, score, extraLine, serverData } = shareInfo;

  /** 공유 URL 생성 — 항상 서버에 데이터 저장 후 웹 URL 반환 */
  const getShareUrl = async (): Promise<string> => {
    // 서버에 공유 데이터 저장 → 웹 URL 반환 (카카오/문자/링크복사 등 외부 공유에 사용)
    if (serverData) {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || '';
        const shareRes = await fetch(`${apiBase}/api/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serverData),
        });
        const { id } = await shareRes.json();
        if (id) return `${WEB_BASE_URL}/s/${id}`;
      } catch { /* 실패 시 기본 URL */ }
    }
    return WEB_BASE_URL;
  };

  const buildShareText = (url: string) => {
    let text = `✨ ${title}\n\n"${summaryLine}"`;
    if (score != null) text += `\n\n🎯 나는 ${score}점! 너는 몇 점?\n오늘의 운세 점수를 비교해보자!`;
    text += `\n\nAI 사주 운세 보러가기 →\n${url}`;
    return text;
  };

  const closeWithReward = () => {
    try { Analytics.click({ log_name: 'share_complete' }); } catch (_) { /* noop */ }
    onShareReward?.();
    onClose();
  };

  /** 토스 친구 초대 (공유 리워드) */
  const handleTossInvite = () => {
    trackShareMethod('toss_invite');
    try { Analytics.click({ log_name: 'fortune_share', method: 'toss_invite' }); } catch (_) { /* noop */ }
    setViralLoading(true);
    try {
      const cleanup = contactsViral({
        options: { moduleId: SHARE_REWARD_MODULE_ID },
        onEvent: (event) => {
          if (event.type === 'sendViral') {
            onShareReward?.();
          } else if (event.type === 'close') {
            setViralLoading(false);
            cleanup();
            if (event.data.sentRewardsCount > 0) {
              onClose();
            }
          }
        },
        onError: () => {
          setViralLoading(false);
          handleCopyLink();
        },
      });
    } catch {
      setViralLoading(false);
      handleCopyLink();
    }
  };

  /** 운세 링크만 복사 */
  const handleCopyLink = async () => {
    trackShareMethod('copy_link');
    try { Analytics.click({ log_name: 'fortune_share', method: 'copy_link' }); } catch (_) { /* noop */ }
    const url = await getShareUrl();
    await copyToClipboard(url);
    showToast('✨ 운세 링크가 복사되었어요!');
    setTimeout(closeWithReward, 1500);
  };

  const handleCopy = async () => {
    trackShareMethod('copy_text');
    try { Analytics.click({ log_name: 'fortune_share', method: 'copy_text' }); } catch (_) { /* noop */ }
    const url = await getShareUrl();
    const text = buildShareText(url);
    await copyToClipboard(text);
    showToast('✨ 운세가 복사되었어요!');
    setTimeout(closeWithReward, 1500);
  };

  const handleNativeShare = async () => {
    trackShareMethod('native_share');
    try { Analytics.click({ log_name: 'fortune_share', method: 'native_share' }); } catch (_) { /* noop */ }
    if (navigator.share) {
      try {
        const url = await getShareUrl();
        await navigator.share({
          title: `${title} - 명리연구소`,
          text: buildShareText(url),
        });
        closeWithReward();
        return;
      } catch {
        // 사용자가 취소한 경우
      }
    } else {
      await handleCopy();
    }
  };

  const [shareLoading, setShareLoading] = useState(false);

  const handleSystemShare = async () => {
    if (shareLoading) return;
    setShareLoading(true);
    trackShareMethod('system_share');
    try { Analytics.click({ log_name: 'fortune_share', method: 'system_share' }); } catch (_) { /* noop */ }

    try {
      const url = await getShareUrl();
      const text = buildShareText(url);

      if (navigator.share) {
        await navigator.share({
          title: `${title} - 명리연구소`,
          text,
        });
        closeWithReward();
      } else {
        await copyToClipboard(text);
        showToast('✨ 운세가 복사되었어요! 원하는 앱에 붙여넣기 하세요');
        setTimeout(closeWithReward, 1500);
      }
    } catch {
      // 사용자 취소
    } finally {
      setShareLoading(false);
    }
  };

  const handleSmsShare = async () => {
    trackShareMethod('sms');
    try { Analytics.click({ log_name: 'fortune_share', method: 'sms' }); } catch (_) { /* noop */ }
    const url = await getShareUrl();
    const body = encodeURIComponent(buildShareText(url));
    const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
    window.location.href = isIOS ? `sms:&body=${body}` : `sms:?body=${body}`;
    closeWithReward();
  };

  return (
    <div className="share-sheet-overlay" onClick={onClose}>
      <Toast message={toastMsg} visible={toastVisible} onDone={() => setToastVisible(false)} />
      <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: 'rgba(26, 39, 68, 0.12)',
            margin: '0 auto 20px',
          }}
        />

        <h3
          style={{
            margin: '0 0 20px',
            fontSize: 19,
            fontWeight: 700,
            color: 'var(--navy-700)',
            letterSpacing: '-0.02em',
          }}
        >
          운세 공유하기
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 토스 친구 초대 (프리미엄 카드 스타일) */}
          <button
            onClick={handleTossInvite}
            disabled={viralLoading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, width: '100%', padding: '16px 20px',
              fontSize: 16, fontWeight: 800, color: '#78520a',
              border: '1.5px solid rgba(201, 169, 98, 0.5)',
              borderRadius: 16, cursor: 'pointer',
              background: 'linear-gradient(135deg, #fff9e6 0%, #fef3cd 40%, #fde68a 100%)',
              boxShadow: '0 4px 16px rgba(201, 169, 98, 0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
              opacity: viralLoading ? 0.7 : 1,
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ fontSize: 20 }}>🎫</span>
            <span>
              <span style={{ display: 'block' }}>친구 초대하고 황금 열람권 받기</span>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#a07a2e', marginTop: 2 }}>
                공유 완료 시 황금 열람권 5개 지급!
              </span>
            </span>
          </button>

          {/* 공유 방법 그리드 (카카오톡 / 문자 / 링크복사) */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleSystemShare}
              disabled={shareLoading}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8,
                padding: '16px 8px',
                background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--gold-400) 100%)',
                color: '#fff',
                border: 'none', borderRadius: 14, cursor: shareLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: shareLoading ? 0.7 : 1,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 15v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700 }}>공유하기</span>
            </button>

            <button
              onClick={handleSmsShare}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8,
                padding: '16px 8px',
                background: '#f1f5f9', color: 'var(--navy-600)',
                border: '1px solid rgba(15,23,42,0.08)', borderRadius: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="1" width="12" height="16" rx="2" stroke="var(--navy-500)" strokeWidth="1.5"/>
                <line x1="7" y1="14" x2="11" y2="14" stroke="var(--navy-500)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 6h6M6 9h4" stroke="var(--navy-500)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700 }}>문자</span>
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8,
                padding: '16px 8px',
                background: '#f1f5f9', color: 'var(--navy-600)',
                border: '1px solid rgba(15,23,42,0.08)', borderRadius: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <path d="M7.5 10.5l3-3M6.75 8.25l-1.28 1.28a2.5 2.5 0 003.53 3.53l1.28-1.28M11.25 9.75l1.28-1.28a2.5 2.5 0 00-3.53-3.53L7.72 6.22" stroke="var(--navy-500)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700 }}>링크 복사</span>
            </button>
          </div>

          {/* 텍스트 복사 (보조) */}
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, width: '100%', padding: '12px 16px',
              fontSize: 13, fontWeight: 600, color: 'var(--navy-400)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="6" y="6" width="10" height="10" rx="2" stroke="var(--navy-400)" strokeWidth="1.5"/>
              <path d="M12 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h2" stroke="var(--navy-400)" strokeWidth="1.5"/>
            </svg>
            전체 텍스트 복사
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '12px 16px',
              fontSize: 14, fontWeight: 600, color: 'var(--navy-400)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
