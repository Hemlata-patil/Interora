import React from 'react';
import { Card, Badge, ProgressBar } from '@/components';
import { User, Award, CheckSquare, Clock } from 'lucide-react';
import type { StudentChatContextData } from '../types/chat';

export interface ChatContextCardProps {
  contextData: StudentChatContextData;
}

export const ChatContextCard: React.FC<ChatContextCardProps> = ({ contextData }) => {
  return (
    <Card title="Student Context Summary" subtitle="Read-only snapshot shared with assigned mentors">
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="font-bold text-slate-900 text-xs block">{contextData.studentName}</span>
            <span className="text-[10px] text-slate-500">Target: {contextData.targetRole}</span>
          </div>
          <Badge variant="indigo">Verified Stats</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">ATTENDANCE</span>
            <span className="font-bold text-emerald-600">{contextData.attendancePercentage}%</span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">TASKS</span>
            <span className="font-bold text-slate-800">{contextData.taskCompletionPercentage}%</span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">MILESTONES</span>
            <span className="font-bold text-indigo-600">{contextData.milestoneCompletionPercentage}%</span>
          </div>
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">CAREER PREP</span>
            <span className="font-bold text-slate-800">{contextData.careerPrepPercentage}%</span>
          </div>
        </div>

        <div className="pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Proficiencies</span>
          <div className="flex flex-wrap gap-1">
            {contextData.keySkills.map((sk, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                {sk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};