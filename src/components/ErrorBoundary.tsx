import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: unknown) {
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        window.gtag('event', 'app_error', { message: msg.slice(0, 140) });
      }
    } catch { /* noop */ }
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    try { window.location.href = '/'; } catch { /* noop */ }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '100dvh', padding: 24, textAlign: 'center',
          background: 'var(--cream-50, #FFFDF5)', gap: 16,
        }}
      >
        <span style={{ fontSize: 44 }}>🔮</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--navy-700, #1a2744)' }}>
          잠시 연결이 흐릿해요
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--navy-400, #455578)', lineHeight: 1.6 }}>
          화면을 다시 불러올게요.<br />다시 시도해도 같은 현상이면 앱을 새로고침해 주세요.
        </p>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: 8, padding: '12px 24px',
            fontSize: 14, fontWeight: 700, color: '#fff',
            border: 'none', borderRadius: 12, cursor: 'pointer',
            background: 'linear-gradient(135deg, #d4a84b 0%, #b88a35 100%)',
            fontFamily: 'inherit',
          }}
        >
          처음부터 다시 보기
        </button>
      </div>
    );
  }
}
