import React from 'react';
import { Card, Badge } from '@/components';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { StudentCareerProfile } from '../types/careerPrep';

export interface SkillsPreparationIndicatorsProps {
  profile: StudentCareerProfile;
}

export interface SkillIndicator {
  skill: string;
  state: 'Strong' | 'Practice Needed' | 'Start Learning';
  reason: string;
}

export const SkillsPreparationIndicators: React.FC<SkillsPreparationIndicatorsProps> = ({ profile }) => {
  const indicators: SkillIndicator[] = [
    {
      skill: 'React.js',
      state: 'Strong',
      reason: 'Verified in current internship tasks and completed learning modules.',
    },
    {
      skill: 'TypeScript',
      state: 'Strong',
      reason: 'Used actively in frontend state refactoring and interface definitions.',
    },
    {
      skill: 'Data Structures (DSA)',
      state: 'Practice Needed',
      reason: 'Essential for technical interview rounds; preparation module in progress.',
    },
    {
      skill: 'SQL Querying',
      state: 'Practice Needed',
      reason: 'Frequently asked in full-stack assessments; 40% prep module completed.',
    },
    {
      skill: 'Node.js / Express',
      state: 'Start Learning',
      reason: 'Recommended for target Full Stack Developer career goal.',
    },
  ];

  const getBadgeVariant = (state: SkillIndicator['state']) => {
    switch (state) {
      case 'Strong':
        return 'emerald';
      case 'Practice Needed':
        return 'amber';
      case 'Start Learning':
        return 'indigo';
    }
  };

  return (
    <Card title="Skills You Can Talk About" subtitle="Preparation indicators derived from internship tasks and learning progress">
      <div className="space-y-3 text-xs">
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {indicators.map((item) => (
            <div key={item.skill} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{item.skill}</span>
                  <Badge variant={getBadgeVariant(item.state)} className="text-[10px]">
                    {item.state}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};