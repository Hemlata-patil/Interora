import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
import { User, Clock, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/services/supabase/supabaseClient';
import {
  fetchStudentConversationsBackend,
  fetchChatMessagesBackend,
  sendChatMessageBackend,
  type ChatConversationRecord,
  type ChatMessageRecord,
} from '@/services/api/backendService';

export const StudentChat: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversationRecord[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user and conversations on mount
  useEffect(() => {
    const loadChatData = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setCurrentUserId(userData.user.id);
      }

      const convs = await fetchStudentConversationsBackend();
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
      setLoading(false);
    };

    loadChatData();
  }, []);

  // Fetch messages for active conversation & subscribe to Realtime updates
  useEffect(() => {
    if (!activeConvId) return;

    const loadMessages = async () => {
      const msgs = await fetchChatMessagesBackend(activeConvId);
      setMessages(msgs);
    };

    loadMessages();

    // Subscribe to real-time chat_messages inserts for active conversation
    const channel = supabase
      .channel(`chat_messages:${activeConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                conversationId: newMsg.conversation_id,
                senderId: newMsg.sender_id,
                message: newMsg.message,
                createdAt: newMsg.created_at,
                senderName: newMsg.sender_id === currentUserId ? 'Me' : 'Support / Mentor',
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvId, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    const res = await sendChatMessageBackend(activeConvId, msgText);
    if (res.success && res.data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data!.id)) return prev;
        return [...prev, res.data!];
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Mentor Chat"
        description="Communicate with your assigned faculty mentor and internship coordinators."
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
              <p className="text-sm text-slate-500 font-medium">Faculty Mentor / Coordinator</p>

              <div className="w-full h-px bg-slate-100 my-4" />

              <div className="w-full text-left space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Live Sync</p>
                  <Badge variant="emerald" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Supabase Realtime Active
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
              const isStudent = msg.senderId === currentUserId;
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
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 font-medium">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
