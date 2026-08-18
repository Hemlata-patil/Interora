import React from 'react';
import { Badge } from '@/components';
import { calculateInternshipCountdown } from '../utils/internshipCountdown';
import { Clock } from 'lucide-react';

export interface InternshipDeadlineBadgeProps {
  deadlineIso?: string;
  className?: string;
}

export const InternshipDeadlineBadge: React.FC<InternshipDeadlineBadgeProps> = ({
  deadlineIso,
  className,
}) => {
  const result = calculateInternshipCountdown(deadlineIso);

  return (
    <Badge variant={result.badgeVariant} className={`text-[10px] inline-flex items-center ${className || ''}`}>
      <Clock className="w-3 h-3 mr-1 inline" />
      <span>{result.statusLabel}</span>
    </Badge>
  );
};