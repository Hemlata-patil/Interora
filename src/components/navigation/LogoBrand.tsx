import React, { useState, useRef } from 'react';
import interoraLogo from '@/assets/interora_logo.png';
import { AdminAuthModal } from './AdminAuthModal';

export interface LogoBrandProps {
  className?: string;
  imageClassName?: string;
  showSubtitle?: boolean;
}

export const LogoBrand: React.FC<LogoBrandProps> = ({
  className = '',
  imageClassName = 'h-9 w-auto object-contain',
  showSubtitle = true,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSubtleFeedback, setShowSubtleFeedback] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (nextCount === 4) {
      setClickCount(0);
      setShowSubtleFeedback(true);
      setTimeout(() => setShowSubtleFeedback(false), 800);
      setShowAdminModal(true);
    } else {
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <>
      <div
        onClick={handleLogoClick}
        className={`flex items-center space-x-3 cursor-pointer select-none transition-transform active:scale-98 ${className} ${
          showSubtleFeedback ? 'ring-2 ring-indigo-500/40 rounded-lg p-0.5' : ''
        }`}
        title="Interora"
      >
        <img
          src={interoraLogo}
          alt="Interora Logo"
          className={imageClassName}
        />
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-none">
            Interora
          </h1>
          {showSubtitle && (
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block mt-1">
              Learn | Intern | Grow
            </span>
          )}
        </div>
      </div>

      {showAdminModal && (
        <AdminAuthModal onClose={() => setShowAdminModal(false)} />
      )}
    </>
  );
};
