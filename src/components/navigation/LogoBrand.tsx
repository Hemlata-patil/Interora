import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import interoraLogo from '@/assets/interora_logo.png';
import { AdminAuthModal } from './AdminAuthModal';

export interface LogoBrandProps {
  className?: string;
  imageClassName?: string;
  showSubtitle?: boolean;
  onNormalClick?: () => void;
  enableNormalNavigation?: boolean;
}

export const LogoBrand: React.FC<LogoBrandProps> = ({
  className = '',
  imageClassName = 'h-9 w-auto object-contain',
  showSubtitle = true,
  onNormalClick,
  enableNormalNavigation = false,
}) => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSubtleFeedback, setShowSubtleFeedback] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    // Crucial: Stop event propagation & default anchor behavior to prevent instant redirect
    e.preventDefault();
    e.stopPropagation();

    // Clear any pending single-click navigation timer
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    // Reset hidden click counter if no further click occurs within 3 seconds
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (nextCount === 4) {
      // 4th Click Triggered: Open Admin/TPO Login directly without landing page redirect
      setClickCount(0);
      setShowSubtleFeedback(true);
      setTimeout(() => setShowSubtleFeedback(false), 800);
      setShowAdminModal(true);
    } else {
      // Set 3-second reset timer
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);

      // If normal single-click navigation is explicitly requested, delay it until we know it's not a multi-click sequence
      if (enableNormalNavigation && nextCount === 1) {
        navTimerRef.current = setTimeout(() => {
          setClickCount(0);
          if (onNormalClick) {
            onNormalClick();
          } else {
            navigate('/');
          }
        }, 1200); // 1.2s delay allows fast 4-click sequence without redirecting
      }
    }
  };

  return (
    <>
      <div
        onClick={handleLogoClick}
        className={`flex items-center space-x-3 cursor-pointer select-none transition-transform active:scale-98 ${className} ${
          showSubtleFeedback ? 'ring-2 ring-indigo-500/50 rounded-lg p-0.5 bg-indigo-50/50' : ''
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
