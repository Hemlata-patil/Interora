import React from 'react';
import { Card, Badge } from '@/components';
import { CheckCircle2, Clock } from 'lucide-react';
import type { RoadmapStep } from '../types/careerPrep';

export interface PreparationRoadmapProps {
  steps: RoadmapStep[];
}

export const PreparationRoadmap: React.FC<PreparationRoadmapProps> = ({ steps }) => {
  return (
    <Card title="Your Interview Preparation Roadmap" subtitle="Structured 7-week milestone guide to master interview rounds">
      <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.week} className="relative flex items-start space-x-4 pl-8">
              <div
                className={`absolute left-1.5 top-0.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : isCurrent
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-slate-300'
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>

              <div className="space-y-0.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold ${isCompleted ? 'text-slate-900' : isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {`Week ${step.week}: ${step.title}`}
                  </h4>
                  {isCompleted && <Badge variant="emerald">Completed</Badge>}
                  {isCurrent && <Badge variant="indigo">Current Phase</Badge>}
                  {step.status === 'upcoming' && <Badge variant="neutral">Upcoming</Badge>}
                </div>
                <p className="text-slate-500 text-[11px] leading-snug">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};