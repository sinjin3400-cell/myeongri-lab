import { useState } from 'react';
import type { FortuneResult, FortuneHighlight } from '../types';
import { buildShareUrl } from '../utils/shareUrl';

type Props = {
  result: FortuneResult;
  userName: string;
  highlight?: FortuneHighlight;
  onClose: () => void;
};

function drawFortuneCard(result: FortuneResult, userName: string): HTMLCanvasElement {
  const W = 720;
  const pad = 48;
  const contentW = W - pad * 2;

  // 임시 캔버스로 높이 계산
  const tmp = document.createElement('canvas');
  tmp.width = W;
  const tmpCtx = tmp.getContext('2d')!;
  tmpCtx.font = '500 28px Pretendard, -apple-system, sans-serif';

  function measureWrapped(ctx: CanvasRenderingContext2D, text: string, maxW: number, lineH: number): number {
    const words = text.split('');
    let line = '';
    let lines = 1;
    for (const char of words) {
      const test = line + char;
      if (ctx.measureText(test).width > maxW && line) {
        lines++;
        line = char;
      } else {
        line = test;
      }
    }
    return lines * lineH;
  }

  // 섹션별 높이 계산
  const sections = [
    { icon: '☀️', title: '총운', text: result.overall },
    { icon: '💕', title: '애정운', text: result.love },
    { icon: '✨', title: '금전운', text: result.money },
    { icon: '🌿', title: '건강운', text: result.health },
  ];

  tmpCtx.font = '400 26px Pretendard, -apple-system, sans-serif';
  const sectionTextW = contentW - 40;
  let totalH = 0;
  totalH += 60;  // 상단 여백
  totalH += 36;  // 날짜
  totalH += 50;  // 제목
  totalH += 20;  // 간격
  totalH += 100; // 점수 영역
  totalH += 30;  // 간격
  // 행운 배지 높이 계산 (줄바꿈 반영)
  tmpCtx.font = '600 20px Pretendard, -apple-system, sans-serif';
  const badgeTexts = [
    `● 행운색: ${result.lucky.color}`,
    `🔢 행운숫자: ${result.lucky.number}`,
    `🧭 행운방향: ${result.lucky.direction}`,
    `🍀 행운아이템: ${result.lucky.item}`,
  ];
  let tmpBx = pad;
  let badgeLineCount = 0;
  for (const bt of badgeTexts) {
    const bw = tmpCtx.measureText(bt).width + 24;
    tmpBx += bw + 10;
    if (tmpBx > W - pad - 100) {
      tmpBx = pad;
      badgeLineCount++;
    }
  }
  totalH += badgeLineCount * 44 + 50;  // 행운 배지 (줄바꿈 반영)
  totalH += 30;  // 간격

  const sectionHeights: number[] = [];
  for (const sec of sections) {
    const textH = measureWrapped(tmpCtx, sec.text, sectionTextW, 38);
    const h = 50 + textH + 30; // title + text + padding
    sectionHeights.push(h);
    totalH += h + 16; // + gap
  }

  totalH += 60; // 워터마크
  totalH += 40; // 하단 여백

  // 실제 캔버스
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // 배경
  ctx.fillStyle = '#fdf8f3';
  ctx.fillRect(0, 0, W, totalH);

  let y = 60;

  // 날짜 + 이름
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  ctx.font = '600 22px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#c9a962';
  ctx.fillText(`${dateStr} (${dayOfWeek}) · ${userName}님의 오늘 운세`, pad, y);
  y += 36;

  // 제목
  ctx.font = '800 36px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#1a2744';
  ctx.fillText('✨ 오늘의 운세가 도착했어요', pad, y);
  y += 50;

  // 점수 카드
  const scoreCardY = y;
  const scoreCardH = 100;
  // 카드 배경
  ctx.fillStyle = '#fffcf5';
  ctx.beginPath();
  ctx.roundRect(pad, scoreCardY, contentW, scoreCardH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 169, 98, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 점수 원
  const scoreX = pad + 56;
  const scoreY = scoreCardY + scoreCardH / 2;
  const scoreR = 34;
  // 트랙
  ctx.beginPath();
  ctx.arc(scoreX, scoreY, scoreR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(26, 39, 68, 0.06)';
  ctx.lineWidth = 7;
  ctx.stroke();
  // 게이지
  const scoreColor = result.score >= 80 ? '#c9a962' : result.score >= 60 ? '#3d5a8a' : '#8aa4cc';
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (result.score / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(scoreX, scoreY, scoreR, startAngle, endAngle);
  ctx.strokeStyle = scoreColor;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';
  // 점수 텍스트
  ctx.font = '800 30px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = scoreColor;
  ctx.textAlign = 'center';
  ctx.fillText(String(result.score), scoreX, scoreY + 6);
  ctx.font = '600 14px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#8aa4cc';
  ctx.fillText('점', scoreX, scoreY + 22);
  ctx.textAlign = 'left';

  // 요약
  ctx.font = '700 28px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#1a2744';
  ctx.fillText(result.summaryLine, pad + 120, scoreCardY + 45);
  if (result.mbtiInsight) {
    ctx.font = '500 22px Pretendard, -apple-system, sans-serif';
    ctx.fillStyle = '#a68338';
    ctx.fillText(result.mbtiInsight.slice(0, 30), pad + 120, scoreCardY + 75);
  }

  y += scoreCardH + 30;

  // 행운 배지
  const lucky = result.lucky;
  const badges = [
    `● 행운색: ${lucky.color}`,
    `🔢 행운숫자: ${lucky.number}`,
    `🧭 행운방향: ${lucky.direction}`,
    `🍀 행운아이템: ${lucky.item}`,
  ];
  ctx.font = '600 20px Pretendard, -apple-system, sans-serif';
  let bx = pad;
  for (const badge of badges) {
    const bw = ctx.measureText(badge).width + 24;
    // 배지 배경
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(bx, y, bw, 36, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(26, 39, 68, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 텍스트
    ctx.fillStyle = '#233558';
    ctx.fillText(badge, bx + 12, y + 25);

    // 행운색 점
    if (badge.startsWith('●')) {
      ctx.beginPath();
      ctx.arc(bx + 16, y + 18, 7, 0, Math.PI * 2);
      ctx.fillStyle = lucky.colorHex || '#c9a962';
      ctx.fill();
      // 텍스트 다시
      ctx.fillStyle = '#233558';
      ctx.fillText(`행운색: ${lucky.color}`, bx + 28, y + 25);
    }

    bx += bw + 10;
    if (bx > W - pad - 100) {
      bx = pad;
      y += 44;
    }
  }
  y += 50;

  // 운세 카드
  const cardColors = [
    'rgba(201, 169, 98, 0.06)',
    'rgba(232, 98, 124, 0.05)',
    'rgba(91, 141, 239, 0.05)',
    'rgba(56, 176, 126, 0.05)',
  ];

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const cardH = sectionHeights[i];

    // 카드 배경
    ctx.fillStyle = cardColors[i];
    ctx.beginPath();
    ctx.roundRect(pad, y, contentW, cardH, 18);
    ctx.fill();
    // 흰색 오버레이
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(pad, y, contentW, cardH, 18);
    ctx.fill();
    // 테두리
    ctx.strokeStyle = 'rgba(26, 39, 68, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pad, y, contentW, cardH, 18);
    ctx.stroke();

    // 제목
    ctx.font = '700 26px Pretendard, -apple-system, sans-serif';
    ctx.fillStyle = '#1a2744';
    ctx.fillText(`${sec.icon} ${sec.title}`, pad + 20, y + 36);

    // 본문
    ctx.font = '400 26px Pretendard, -apple-system, sans-serif';
    ctx.fillStyle = '#3d5a8a';
    let textY = y + 66;
    let line = '';
    for (const char of sec.text) {
      const test = line + char;
      if (ctx.measureText(test).width > sectionTextW && line) {
        ctx.fillText(line, pad + 20, textY);
        textY += 38;
        line = char;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, pad + 20, textY);

    y += cardH + 16;
  }

  // 워터마크
  y += 10;
  ctx.font = '600 20px Pretendard, -apple-system, sans-serif';
  ctx.fillStyle = '#c9a962';
  ctx.textAlign = 'center';
  ctx.fillText('✨ 명리연구소 — AI 사주 운세', W / 2, y);
  ctx.textAlign = 'left';

  return canvas;
}

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
  const [saving, setSaving] = useState(false);

  // 공유 URL 생성 (highlight가 있으면 운세 데이터 포함)
  const shareUrl = highlight
    ? buildShareUrl(userName, highlight, {
        overall: result.overall,
        love: result.love,
        money: result.money,
        health: result.health,
      })
    : 'https://myeongri-lab.vercel.app';

  const shareText = `✨ ${userName}님의 오늘 운세\n\n${result.summaryLine}\n🍀 행운색: ${result.lucky.color} | 행운숫자: ${result.lucky.number}\n\n${userName}님의 운세 보기 →\n${shareUrl}`;

  const handleSaveImage = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const canvas = drawFortuneCard(result, userName);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) {
        alert('이미지 생성에 실패했어요.');
        setSaving(false);
        return;
      }

      // 모바일에서 Web Share API로 공유 시도
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      if (isMobile && navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], `myeongri-${userName}.png`, { type: 'image/png' });
          const shareData = { files: [file], title: `${userName}님의 운세`, text: '명리연구소에서 나만의 운세 보기' };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            onClose();
            setSaving(false);
            return;
          }
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            setSaving(false);
            return;
          }
        }
      }

      // 이미지 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myeongri-${userName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('운세 이미지가 저장되었어요! 📸');
      onClose();
    } catch (err) {
      console.error('이미지 캡처 에러:', err);
      alert('이미지 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('운세가 복사되었어요! 친구에게 공유해보세요 ✨');
      onClose();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('운세가 복사되었어요!');
      onClose();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}님의 운세 - 명리연구소`,
          text: shareText,
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
    try {
      await loadKakaoSDK();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Kakao = (window as any).Kakao;
      if (!Kakao.isInitialized()) {
        const key = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
        if (!key) {
          alert('카카오 앱 키가 설정되지 않았어요. .env에 VITE_KAKAO_JS_KEY를 추가해주세요.');
          return;
        }
        Kakao.init(key);
      }
      const kakaoBaseUrl = 'https://myeongri-lab.vercel.app';
      // 카카오 SDK는 패킷 10KB 제한 → 운세 텍스트 없이 최소 데이터만 포함
      const kakaoShareUrl = highlight
        ? buildShareUrl(userName, highlight)
        : kakaoBaseUrl;
      const score = result.score;
      const desc = [
        `🎯 운세 점수: ${score}점`,
        `"${result.summaryLine}"`,
        `🍀 행운색: ${result.lucky.color} | 🔢 ${result.lucky.number}`,
      ].join('\n');
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `✨ ${userName}님의 오늘 운세`,
          description: desc,
          imageUrl: `${kakaoBaseUrl}/og-image.png?v=2`,
          link: {
            mobileWebUrl: kakaoShareUrl,
            webUrl: kakaoShareUrl,
          },
        },
        buttons: [
          {
            title: `${userName}님의 운세 보기 🔮`,
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
          await navigator.share({ title: `${userName}님의 운세`, text: shareText });
          onClose();
        } catch { /* 취소 */ }
      } else {
        alert('카카오톡 공유에 실패했어요. 텍스트 복사로 공유해주세요.');
      }
    }
  };

  const handleSmsShare = () => {
    const body = encodeURIComponent(shareText);
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
            className="btn-primary btn-gold"
            onClick={handleSaveImage}
            disabled={saving}
            style={{ gap: 8 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="2" stroke="#fff" strokeWidth="1.5" />
              <circle cx="7.5" cy="7.5" r="1.5" stroke="#fff" strokeWidth="1.2" />
              <path d="M3 13l4-4 3 3 2.5-2.5L17 14" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {saving ? '이미지 생성 중...' : '이미지로 저장 / 공유'}
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
