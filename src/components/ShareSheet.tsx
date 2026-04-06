import type { FortuneResult, FortuneHighlight } from '../types';
import { trackShareMethod } from '../utils/analytics';

type Props = {
  result: FortuneResult;
  userName: string;
  highlight?: FortuneHighlight;
  onClose: () => void;
};

function loadKakaoSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).Kakao) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Kakao SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

export function ShareSheet({ result, userName, highlight, onClose }: Props) {
  const kakaoBaseUrl = 'https://myeongri-lab.vercel.app';

  /** 서버에 공유 데이터를 저장하고 짧은 URL을 반환 */
  const getShortShareUrl = async (): Promise<string> => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const shareRes = await fetch(`${apiBase}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n: userName, sl: result.summaryLine, sc: result.score,
          bc: highlight?.bestCategory || 'overall', bs: highlight?.bestSummary || '',
          cc: highlight?.cautionCategory || 'health', cs: highlight?.cautionSummary || '',
          lc: result.lucky.color, ln: result.lucky.number,
          ld: result.lucky.direction, li: result.lucky.item,
          ov: result.overall, lo: result.love, mo: result.money, he: result.health,
        }),
      });
      const { id } = await shareRes.json();
      if (id) return `${kakaoBaseUrl}/s/${id}`;
    } catch { /* 실패 시 기본 URL */ }
    return kakaoBaseUrl;
  };

  const buildShareText = (url: string) =>
    `✨ ${userName}님의 오늘 운세\n\n${result.summaryLine}\n🍀 행운색: ${result.lucky.color} | 행운숫자: ${result.lucky.number}\n\n${userName}님의 운세 보기 →\n${url}`;

  /** 운세 링크만 복사 */
  const handleCopyLink = async () => {
    trackShareMethod('copy_link');
    const url = await getShortShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      alert('운세 링크가 복사되었어요! 친구에게 공유해보세요 ✨');
      onClose();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('운세 링크가 복사되었어요!');
      onClose();
    }
  };

  const handleCopy = async () => {
    trackShareMethod('copy_text');
    const url = await getShortShareUrl();
    const text = buildShareText(url);
    try {
      await navigator.clipboard.writeText(text);
      alert('운세가 복사되었어요! 친구에게 공유해보세요 ✨');
      onClose();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('운세가 복사되었어요!');
      onClose();
    }
  };

  const handleNativeShare = async () => {
    trackShareMethod('native_share');
    if (navigator.share) {
      try {
        const url = await getShortShareUrl();
        await navigator.share({
          title: `${userName}님의 운세 - 명리연구소`,
          text: buildShareText(url),
        });
        onClose();
        return;
      } catch {
        // 사용자가 취소한 경우
      }
    } else {
      await handleCopy();
    }
  };

  const handleKakaoShare = async () => {
    trackShareMethod('kakao');
    try {
      await loadKakaoSDK();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Kakao = (window as any).Kakao;
      if (!Kakao.isInitialized()) {
        const key = (import.meta.env.VITE_KAKAO_JS_KEY as string | undefined)?.trim();
        if (!key) {
          alert('카카오 앱 키가 설정되지 않았어요. .env에 VITE_KAKAO_JS_KEY를 추가해주세요.');
          return;
        }
        Kakao.init(key);
      }
      const kakaoShareUrl = await getShortShareUrl();
      const desc = `🎯 오늘의 운세 점수: ${result.score}점\n"${result.summaryLine}"\n🍀 행운색: ${result.lucky.color} | 🔢 ${result.lucky.number}`;
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `✨ ${userName}님의 오늘 운세`,
          description: desc,
          imageUrl: `${kakaoBaseUrl}/og-image.png?v=3`,
          link: {
            mobileWebUrl: kakaoShareUrl,
            webUrl: kakaoShareUrl,
          },
        },
        buttons: [
          {
            title: '나도 운세 보기 🔮',
            link: {
              mobileWebUrl: kakaoShareUrl,
              webUrl: kakaoShareUrl,
            },
          },
        ],
      });
      onClose();
    } catch {
      if (navigator.share) {
        try {
          const fallbackUrl = await getShortShareUrl();
          await navigator.share({ title: `${userName}님의 운세`, text: buildShareText(fallbackUrl) });
          onClose();
        } catch { /* 취소 */ }
      } else {
        alert('카카오톡 공유에 실패했어요. 텍스트 복사로 공유해주세요.');
      }
    }
  };

  const handleSmsShare = async () => {
    trackShareMethod('sms');
    const url = await getShortShareUrl();
    const body = encodeURIComponent(buildShareText(url));
    const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
    window.location.href = isIOS ? `sms:&body=${body}` : `sms:?body=${body}`;
    onClose();
  };

  return (
    <div className="share-sheet-overlay" onClick={onClose}>
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
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, width: '100%', padding: '14px 20px',
              fontSize: 16, fontWeight: 700, color: '#fff',
              border: 'none', borderRadius: 14, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7.5 10.5l3-3M6.75 8.25l-1.28 1.28a2.5 2.5 0 003.53 3.53l1.28-1.28M11.25 9.75l1.28-1.28a2.5 2.5 0 00-3.53-3.53L7.72 6.22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            운세 링크 복사하기
          </button>

          <button
            className="btn-secondary"
            onClick={handleKakaoShare}
            style={{ gap: 8, background: '#FEE500', color: '#191919', border: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3C5.58 3 2 5.87 2 9.35c0 2.21 1.47 4.15 3.68 5.25l-.94 3.44c-.08.29.25.52.5.35l4.12-2.73c.21.02.42.03.64.03 4.42 0 8-2.87 8-6.35S14.42 3 10 3z" fill="#191919"/>
            </svg>
            카카오톡으로 공유하기
          </button>

          <button
            className="btn-secondary"
            onClick={handleSmsShare}
            style={{ gap: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="1" width="12" height="16" rx="2" stroke="var(--navy-400)" strokeWidth="1.5"/>
              <line x1="7" y1="14" x2="11" y2="14" stroke="var(--navy-400)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 6h6M6 9h4" stroke="var(--navy-400)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            문자로 공유하기
          </button>

          <button
            className="btn-secondary"
            onClick={handleNativeShare}
            style={{ gap: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM4.5 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM13.5 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.44 10.24l5.13 2.77M11.56 5l-5.12 2.75"
                stroke="var(--navy-400)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            다른 앱으로 공유하기
          </button>

          <button
            className="btn-secondary"
            onClick={handleCopy}
            style={{ gap: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="6"
                y="6"
                width="10"
                height="10"
                rx="2"
                stroke="var(--navy-400)"
                strokeWidth="1.5"
              />
              <path
                d="M12 6V4a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h2"
                stroke="var(--navy-400)"
                strokeWidth="1.5"
              />
            </svg>
            텍스트 복사하기
          </button>

          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ marginTop: 4 }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
