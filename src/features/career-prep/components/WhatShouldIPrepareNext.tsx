import React from 'react';
import { Card, Badge, Button } from '@/components';
import { Target, ArrowRight, Lightbulb } from 'lucide-react';
import type { RecommendedNextStep } from '../types/careerPrep';

export interface WhatShouldIPrepareNextProps {
  steps: RecommendedNextStep[];
  onSelectCategory: (category: string) => void;
}

export const WhatShouldIPrepareNext: React.FC<WhatShouldIPrepareNextProps> = ({
  steps,
  onSelectCategory,
}) => {
  return (
    <Card title="What Should I Prepare Next?" subtitle="Personalized recommended preparation focus areas based on your career goal">
      <div className="space-y-3 text-xs">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{step.topic}</h4>
                  <Badge variant={step.priority === 'High' ? 'indigo' : 'neutral'}>
                    {step.priority} Priority
                  </Badge>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{step.reason}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectCategory(step.category)}
              className="shrink-0"
            >
              <span>Explore {step.category}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};