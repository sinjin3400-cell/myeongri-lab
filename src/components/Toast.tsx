import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  visible: boolean;
  onDone: () => void;
  duration?: number;
};

export function Toast({ message, visible, onDone, duration = 2000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) { setShow(false); return; }
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 300); // fade-out 후 콜백
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDone]);

  if (!visible && !show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: `translateX(-50%) translateY(${show ? '0' : '20px'})`,
        opacity: show ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '12px 24px',
        borderRadius: 14,
        background: 'rgba(26, 39, 68, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}
