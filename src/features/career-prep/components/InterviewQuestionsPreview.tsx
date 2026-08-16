import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import type { InterviewQuestion } from '../types/careerPrep';

export interface InterviewQuestionsPreviewProps {
  questions: InterviewQuestion[];
}

export const InterviewQuestionsPreview: React.FC<InterviewQuestionsPreviewProps> = ({ questions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Card title="Interview Questions To Practice" subtitle="Common technical and behavioral questions asked during software engineering rounds">
      <div className="space-y-3 text-xs">
        {questions.map((iq) => {
          const isExpanded = expandedId === iq.id;

          return (
            <div key={iq.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
                onClick={() => toggleExpand(iq.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="indigo" className="text-[10px]">
                      {iq.category}
                    </Badge>
                    <Badge variant={iq.difficulty === 'Beginner' ? 'emerald' : 'amber'} className="text-[10px]">
                      {iq.difficulty}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{iq.question}</h4>
                </div>

                <button className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-900 block uppercase text-[10px] text-indigo-700">Sample Answer Key Points</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {iq.sampleKeyPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};