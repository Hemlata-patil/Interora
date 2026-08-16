import React from 'react';
import { Card, Badge, ProgressBar } from '@/components';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CareerReadinessResult } from '../utils/careerMetrics';

export interface CareerReadinessCardProps {
  readiness: CareerReadinessResult;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({ readiness }) => {
  const getBadgeVariant = (level: CareerReadinessResult['level']) => {
    switch (level) {
      case 'Excellent':
        return 'emerald';
      case 'Strong':
        return 'indigo';
      case 'Developing':
        return 'amber';
      default:
        return 'rose';
    }
  };

  return (
    <Card title="Career Readiness Index" subtitle="Calculated from your verified internship performance metrics">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{readiness.score}</span>
              <span className="text-slate-400 font-bold text-lg">/ 100</span>
              <Badge variant={getBadgeVariant(readiness.level)} className="ml-2 px-3 py-1 font-bold">
                {readiness.level} Readiness
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic calculation based on attendance (15%), tasks (25%), milestones (25%), mentor evaluation (25%), and work logs (10%).
            </p>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>Overall Score</span>
              <span>{readiness.score}%</span>
            </div>
            <ProgressBar progress={readiness.score} color={readiness.score >= 75 ? 'emerald' : 'indigo'} />
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">ATTENDANCE (15%)</span>
            <span className="font-bold text-slate-800 text-sm">{readiness.breakdown.attendanceContribution} pts</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">TASKS (25%)</span>
            <span className="font-bold text-slate-800 text-sm">{readiness.breakdown.taskContribution} pts</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">MILESTONES (25%)</span>
            <span className="font-bold text-slate-800 text-sm">{readiness.breakdown.milestoneContribution} pts</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">EVALUATION (25%)</span>
            <span className="font-bold text-slate-800 text-sm">{readiness.breakdown.evaluationContribution} pts</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">LOGS (10%)</span>
            <span className="font-bold text-slate-800 text-sm">{readiness.breakdown.workLogContribution} pts</span>
          </div>
        </div>
      </div>
    </Card>
  );
};