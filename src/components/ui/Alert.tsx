import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className,
}) => {
  const styles = {
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800 icon:text-indigo-600',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon:text-emerald-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon:text-amber-600',
    error: 'bg-rose-50 border-rose-200 text-rose-800 icon:text-rose-600',
  };

  const Icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const IconComponent = Icons[type];

  return (
    <div className={cn('p-4 border rounded-xl flex items-start space-x-3 text-xs leading-relaxed', styles[type], className)}>
      <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        {title && <h5 className="font-semibold mb-1 text-sm">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
};
