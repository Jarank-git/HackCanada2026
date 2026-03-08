import { useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const timer = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, [location.pathname]);

  return (
    <div className={`page-transition${visible ? ' page-transition--visible' : ''}`}>
      {children}
    </div>
  );
}
