import React from 'react';
import { Badge } from '@/components';
import { GraduationCap, Building2, Circle } from 'lucide-react';
import type { Mentor, Conversation } from '../types/chat';

export interface MentorListProps {
  mentors: Mentor[];
  conversations: Conversation[];
  selectedMentorId: string | null;
  onSelectMentor: (mentorId: string) => void;
}

export const MentorList: React.FC<MentorListProps> = ({
  mentors,
  conversations,
  selectedMentorId,
  onSelectMentor,
}) => {
  return (
    <div className="divide-y divide-slate-100 bg-white">
      {mentors.map((mentor) => {
        const conv = conversations.find((c) => c.mentorId === mentor.id);
        const isSelected = selectedMentorId === mentor.id;
        const isFaculty = mentor.type === 'FACULTY';

        return (
          <div
            key={mentor.id}
            onClick={() => onSelectMentor(mentor.id)}
            className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-all ${
              isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
            }`}
          >
            {/* Mentor Initials Avatar */}
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shadow-xs ${
                  isFaculty ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {mentor.avatarInitials}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  mentor.status === 'ONLINE'
                    ? 'bg-emerald-500'
                    : mentor.status === 'AWAY'
                    ? 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
              />
            </div>

            {/* Info Preview */}
            <div className="flex-1 min-w-0 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 truncate">{mentor.name}</h4>
                {conv && <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageAt}</span>}
              </div>

              <div className="flex items-center space-x-1.5">
                <Badge variant={isFaculty ? 'indigo' : 'emerald'} className="text-[9px] px-1.5 py-0">
                  {isFaculty ? 'Faculty Mentor' : 'Industry Mentor'}
                </Badge>
                <span className="text-[10px] text-slate-400 truncate">{mentor.institutionOrCompany}</span>
              </div>

              {conv && (
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{conv.lastMessage}</p>
                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};