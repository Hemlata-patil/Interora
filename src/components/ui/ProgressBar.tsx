import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercent = true,
  color = 'indigo',
  className,
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>{label}</span>
          {showPercent && <span>{Math.round(safeProgress)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', colors[color])}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};
