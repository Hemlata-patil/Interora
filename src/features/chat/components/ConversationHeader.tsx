import React from 'react';
import { Badge } from '@/components';
import { GraduationCap, Building2, ArrowLeft } from 'lucide-react';
import type { Mentor } from '../types/chat';

export interface ConversationHeaderProps {
  mentor: Mentor;
  onBackMobile?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({ mentor, onBackMobile }) => {
  const isFaculty = mentor.type === 'FACULTY';

  return (
    <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {onBackMobile && (
          <button onClick={onBackMobile} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative">
          <div
            className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shadow-xs ${
              isFaculty ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {mentor.avatarInitials}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              mentor.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          />
        </div>

        <div className="text-xs">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-sm">{mentor.name}</h3>
            <Badge variant={isFaculty ? 'indigo' : 'emerald'} className="text-[10px]">
              {isFaculty ? 'Faculty Mentor' : 'Industry Mentor'}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {mentor.designation} â€¢ <span className="font-medium text-slate-700">{mentor.institutionOrCompany}</span>
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
        <span>{mentor.status === 'ONLINE' ? 'Active Support' : 'Offline'}</span>
      </div>
    </div>
  );
};