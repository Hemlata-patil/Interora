import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className,
}) => {
  return (
    <div className={cn('p-8 text-center bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center space-y-3', className)}>
      <div className="p-3 bg-slate-100 text-slate-500 rounded-full">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
