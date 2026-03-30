/** 결과 화면 상단 반짝 별 장식 */
export function ResultSparkleDecor() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 14,
        marginBottom: 16,
        opacity: 0.95,
      }}
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
          fill="#c9a962"
          style={{ animation: 'app-twinkle 2s ease-in-out infinite' }}
        />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l1.2 4.2L17 9l-4.8 1.4L12 15l-1.2-4.6L6 9l4.8-1.4L12 3z"
          fill="#e0ca95"
          style={{ animation: 'app-twinkle 2.4s ease-in-out infinite', animationDelay: '0.2s' }}
        />
      </svg>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
          fill="#5a7db5"
          style={{ animation: 'app-twinkle 2.2s ease-in-out infinite', animationDelay: '0.4s' }}
        />
      </svg>
    </div>
  );
}
