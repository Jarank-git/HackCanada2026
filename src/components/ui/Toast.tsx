import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onDone, duration = 2000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 300); // wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDone]);

  if (!visible && !show) return null;

  return (
    <div className={`toast${show ? ' toast--visible' : ''}`} role="status" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}
