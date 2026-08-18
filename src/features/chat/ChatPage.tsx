import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
import { getStudentMentors, mockFacultyMentorRecord } from './data/mockChatData';
import type { Mentor } from './types/chat';
import { Send, Info } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [isIntern] = useState<boolean>(true);
  const mentors = getStudentMentors(isIntern);
  const [activeMentor, setActiveMentor] = useState<Mentor>(mentors[0]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'mentor', text: 'Hello Alex! How can I assist with your internship journey today?', time: '10:15 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = { sender: 'student', text: messageInput, time: 'Just now' };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
  };

  const handleQuickPrompt = (text: string) => {
    setMessageInput(text);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Mentor Connect"
        description="Communicate with your assigned Faculty Advisor and Industry Mentor for academic and professional guidance."
      />

      {/* Role Guidance Banner */}
      {!isIntern ? (
        <div className="p-4 bg-indigo-900 text-white rounded-2xl flex items-start space-x-3 text-xs">
          <Info className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Need help finding the right internship?</h4>
            <p className="text-indigo-100">
              Your Faculty Mentor can guide you based on your skills, interests, resume, and career goals.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => handleQuickPrompt('Can you review my skill gaps for upcoming internships?')} className="bg-white/10 text-white border-white/20 text-[11px]">
                Ask About Skill Gaps
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickPrompt('What internships should I target for my profile?')} className="bg-white/10 text-white border-white/20 text-[11px]">
                Ask About Opportunities
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickPrompt('Can you provide feedback on my resume?')} className="bg-white/10 text-white border-white/20 text-[11px]">
                Ask About Resume
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600">
            <strong>Faculty Mentor:</strong> Academic & Career Guidance â€¢ <strong>Industry Mentor:</strong> Technical Project & Workplace Feedback
          </span>
          <Badge variant="indigo">2 Mentors Connected</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mentor Selector Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Your Mentors</h4>
          {mentors.map((m) => (
            <Card
              key={m.id}
              onClick={() => setActiveMentor(m)}
              className={`p-3 cursor-pointer transition-all ${
                activeMentor.id === m.id ? 'border-indigo-600 bg-indigo-50/40' : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {m.avatarInitials}
                </div>
                <div className="overflow-hidden">
                  <h5 className="font-bold text-slate-900 text-xs truncate">{m.name}</h5>
                  <p className="text-[10px] text-slate-500 truncate">{m.designation}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="flex flex-col h-[450px]">
            {/* Header */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{activeMentor.name}</h4>
                <span className="text-[10px] text-slate-400">{activeMentor.designation}</span>
              </div>
              <Badge variant="emerald">{activeMentor.status}</Badge>
            </div>

            {/* Messages Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-xl shadow-xs ${
                      msg.sender === 'student'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        msg.sender === 'student' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Message ${activeMentor.name}...`}
                className="flex-1 p-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <Button variant="primary" size="sm" type="submit" className="bg-indigo-600 text-white">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};