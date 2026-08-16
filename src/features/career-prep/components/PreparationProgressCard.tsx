import React from 'react';
import { Card, ProgressBar } from '@/components';
import { Target, CheckCircle2 } from 'lucide-react';
import type { PreparationProgress } from '../types/careerPrep';

export interface PreparationProgressCardProps {
  progress: PreparationProgress;
}

export const PreparationProgressCard: React.FC<PreparationProgressCardProps> = ({ progress }) => {
  return (
    <Card title="Interview Preparation Progress" subtitle="Track your resource completion and readiness across key technical categories">
      <div className="space-y-4">
        {/* Main Progress Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {progress.overallPercentage}%
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Overall Preparation Completion</h4>
              <p className="text-xs text-slate-500">{`${progress.completedCount} of ${progress.totalCount} learning resources completed`}</p>
            </div>
          </div>
          <div className="w-full sm:w-48 space-y-1">
            <ProgressBar progress={progress.overallPercentage} color="indigo" />
          </div>
        </div>

        {/* Category Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {progress.categories.map((cat) => (
            <div key={cat.category} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-800">
                <span className="truncate">{cat.category}</span>
                <span className="text-indigo-600">{cat.percentage}%</span>
              </div>
              <ProgressBar progress={cat.percentage} color="indigo" />
              <span className="text-[10px] text-slate-400 block">{`${cat.completedCount}/${cat.totalCount} completed`}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};