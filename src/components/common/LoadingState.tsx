import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className,
}) => {
  return (
    <div className={cn('p-8 text-center flex flex-col items-center justify-center space-y-3', className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent" />
      <p className="text-xs text-slate-500 font-medium">{message}</p>
    </div>
  );
};
