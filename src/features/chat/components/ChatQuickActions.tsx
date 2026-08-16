import React from 'react';
import { Badge } from '@/components';
import { HelpCircle, Sparkles, Briefcase, GraduationCap, Code } from 'lucide-react';
import type { MentorType } from '../types/chat';

export interface ChatQuickActionsProps {
  activeMentorType: MentorType;
  onSelectPrompt: (promptText: string) => void;
}

export const ChatQuickActions: React.FC<ChatQuickActionsProps> = ({
  activeMentorType,
  onSelectPrompt,
}) => {
  const facultyPrompts = [
    'What skills should I learn next for placement readiness?',
    'I am having difficulty finding a suitable internship. Can you help me target the right roles?',
    'Can you review my current milestone progress and skill roadmap?',
    'What projects should I build to improve my resume for upcoming placements?',
  ];

  const industryPrompts = [
    'How can I improve my technical React/TypeScript project for industry standards?',
    'What are the key technical skills companies look for during frontend interviews?',
    'Could you give feedback on my current task submissions and work log quality?',
    'How do software teams handle production deployment and code reviews?',
  ];

  const prompts = activeMentorType === 'FACULTY' ? facultyPrompts : industryPrompts;

  return (
    <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Prompts for {activeMentorType === 'FACULTY' ? 'Faculty Mentor' : 'Industry Mentor'}</span>
        </div>
        <Badge variant={activeMentorType === 'FACULTY' ? 'indigo' : 'emerald'} className="text-[9px]">
          {activeMentorType === 'FACULTY' ? 'Academic & Placement' : 'Production & Technical'}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-full text-[10px] font-medium transition-colors text-left truncate max-w-full"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};