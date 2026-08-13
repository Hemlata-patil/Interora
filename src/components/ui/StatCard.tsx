import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <div className={cn('p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between', className)}>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        {trend && (
          <p className={cn('text-xs font-medium mt-2', trend.isPositive ? 'text-emerald-600' : 'text-rose-600')}>
            {trend.value}
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
