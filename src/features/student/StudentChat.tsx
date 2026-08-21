import React, { useState, useRef, useEffect } from 'react';
import { PageHeader, Card, Button, Badge } from '@/components';
import { Send, User, Clock, CheckCircle2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'student' | 'faculty';
  text: string;
  timestamp: string;
  isRead?: boolean;
}

const mockMessages: Message[] = [
  {
    id: 'm1',
    sender: 'faculty',
    text: 'Hello! I am Dr. Priya Sharma, your Faculty Mentor. How is your preparation for the Frontend Developer Internship at TechCorp going?',
    timestamp: '10:00 AM',
  },
  {
    id: 'm2',
    sender: 'student',
    text: 'Hi Dr. Sharma! It is going well. I have been brushing up on React and completing the assignments.',
    timestamp: '10:15 AM',
    isRead: true,
  },
  {
    id: 'm3',
    sender: 'faculty',
    text: 'That is excellent. Please let me know if you need any guidance or have questions regarding the technical interview round.',
    timestamp: '10:30 AM',
  }
];

export const StudentChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: `m${Date.now()}`,
      sender: 'student',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages([...messages, msg]);
    setNewMessage('');
    
    setTimeout(() => {
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        sender: 'faculty',
        text: 'Noted. Keep up the good work!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Mentor Chat"
        description="Communicate with your assigned faculty mentor regarding your internship."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        
        {/* Mentor Info Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dr. Priya Sharma</h3>
              <p className="text-sm text-slate-500 font-medium">Internship Coordinator</p>
              
              <div className="w-full h-px bg-slate-100 my-4" />
              
              <div className="w-full text-left space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Related Application</p>
                  <p className="text-sm font-medium text-slate-800">Frontend Developer Intern</p>
                  <p className="text-sm text-slate-600">TechCorp</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                  <Badge variant="amber" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Faculty Approval
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dr. Priya Sharma</h3>
                <div className="flex items-center text-xs text-emerald-600 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" />
                  Online
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isStudent = msg.sender === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[75%] ${isStudent ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {isStudent ? (
                        <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">ME</div>
                      ) : (
                        <User className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    
                    <div className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isStudent
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 font-medium">
                        <span>{msg.timestamp}</span>
                        {isStudent && msg.isRead && (
                          <CheckCircle2 className="w-3 h-3 text-indigo-500 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-slate-700 placeholder:text-slate-400"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
