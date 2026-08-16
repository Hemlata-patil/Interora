import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '../types/chat';

export interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isStudent = message.senderType === 'STUDENT';

  return (
    <div className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'} space-y-1`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
          isStudent
            ? 'bg-indigo-600 text-white rounded-br-xs'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.message}</p>

        <div
          className={`flex items-center justify-end space-x-1 text-[9px] mt-1.5 ${
            isStudent ? 'text-indigo-200' : 'text-slate-400'
          }`}
        >
          <span>{message.timestamp}</span>
          {isStudent && (
            <span>
              {message.status === 'READ' ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-300 inline" />
              ) : (
                <Check className="w-3 h-3 text-indigo-200 inline" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};