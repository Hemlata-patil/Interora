import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import type { CareerAnalysisInput, ChatMessage } from '../types/aiCareer';
import { sendAICareerMessage } from '../services/aiCareerService';

export interface AICareerAssistantProps {
  input: CareerAnalysisInput;
}

export const AICareerAssistant: React.FC<AICareerAssistantProps> = ({ input }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello ${input.student.name}! I am your AI Career Advisor. Ask me anything about your current performance, recommended projects, or target career path as a ${input.student.targetCareer}.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const replyText = await sendAICareerMessage(input, query, messages);
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I ran into an issue connecting to the AI service. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Ask AI Career Assistant" subtitle="Interactive advice personalized to your student performance data">
      <div className="space-y-4">
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-[9px] block mt-1 text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-indigo-600 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[11px] font-semibold">AI Assistant is typing...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question (e.g. What skills should I focus on next?)"
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
          <Button variant="primary" size="sm" type="submit" disabled={isLoading || !inputQuery.trim()}>
            <Send className="w-3.5 h-3.5 mr-1" /> Ask AI
          </Button>
        </form>
      </div>
    </Card>
  );
};