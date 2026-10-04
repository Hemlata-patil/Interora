import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components';
import { User, Clock, Send, RotateCw, MessageSquare } from 'lucide-react';
import {
  getCurrentUserBackend,
  fetchActiveStudentInternshipBackend,
  fetchStudentConversationsBackend,
  fetchChatMessagesBackend,
  sendChatMessageBackend,
  createChatConversationBackend,
  type ChatConversationRecord,
  type ChatMessageRecord,
  type ActiveStudentInternshipRecord,
} from '@/services/api/backendService';

export const StudentChat: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversationRecord[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeInternship, setActiveInternship] = useState<ActiveStudentInternshipRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user session, active internship, and conversations on mount
  const loadChatData = async () => {
    setLoading(true);
    try {
      const [user, internship, convs] = await Promise.all([
        getCurrentUserBackend(),
        fetchActiveStudentInternshipBackend().catch(() => null),
        fetchStudentConversationsBackend(),
      ]);

      if (user) {
        setCurrentUserId(user.id);
      }
      if (internship) {
        setActiveInternship(internship);
      }
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    } catch (err) {
      console.warn('[StudentChat] Failed to load initial chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, []);

  // Fetch messages for active conversation
  const loadMessages = async (convId?: string) => {
    const targetId = convId || activeConvId;
    if (!targetId) return;

    setRefreshing(true);
    try {
      const msgs = await fetchChatMessagesBackend(targetId);
      setMessages(msgs);
    } catch (err) {
      console.warn('[StudentChat] Failed to load messages:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    loadMessages(activeConvId);

    // Refresh messages on window focus (controlled focus-based sync without WebSockets)
    const handleFocus = () => {
      loadMessages(activeConvId);
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendError(null);

    const msgText = newMessage.trim();
    setNewMessage('');

    if (activeConvId) {
      const res = await sendChatMessageBackend(activeConvId, msgText);
      if (res.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data!.id)) return prev;
          return [...prev, res.data!];
        });
      } else {
        setSendError(res.error || 'Failed to send message.');
      }
    } else if (activeInternship?.mentorUserId) {
      // If no conversation exists yet, initiate conversation with assigned mentor
      const res = await createChatConversationBackend(
        [activeInternship.mentorUserId],
        msgText
      );
      if (res.success && res.data) {
        setActiveConvId(res.data.id);
        const convs = await fetchStudentConversationsBackend();
        setConversations(convs);
        if (res.data.messages) {
          setMessages(
            res.data.messages.map((m: any) => ({
              id: m.id,
              conversationId: m.conversationId,
              senderId: m.senderId,
              message: m.message,
              createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date(m.createdAt).toISOString(),
              senderName: m.sender?.fullName || 'Me',
            }))
          );
        }
      } else {
        setSendError(res.error || 'Failed to start conversation.');
      }
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const displayMentorName =
    activeConv?.participantName ||
    activeInternship?.mentorName ||
    'Dr. Rajesh Sharma (CS1 Mentor)';
  const displayMentorRole =
    activeConv?.participantRole ||
    activeInternship?.mentorRole ||
    'Faculty Mentor / Coordinator';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Mentor Chat"
        description="Communicate with your assigned faculty mentor and internship coordinators."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Mentor Info & Conversation Selector Panel */}
        <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col items-center text-center p-4 border-b border-slate-100">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mb-3">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {displayMentorName}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {displayMentorRole}
              </p>

              <div className="w-full text-left space-y-2 mt-4 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Backend Sync
                  </p>
                  <Badge variant="neutral" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                    <Clock className="w-3 h-3 mr-1 text-slate-500" />
                    PostgreSQL Focus Sync
                  </Badge>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Messages sync on focus or manual refresh (Realtime streaming disabled).
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation list if multiple */}
            {conversations.length > 1 && (
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Conversations
                </p>
                {conversations.map((c) => {
                  const isSelected = c.id === activeConvId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">
                          {c.participantName || 'Discussion'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
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
                <h3 className="text-sm font-bold text-slate-900">{displayMentorName}</h3>
                <div className="flex items-center text-xs text-slate-500 font-medium">
                  <span>{displayMentorRole}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMessages()}
                disabled={refreshing || !activeConvId}
                title="Refresh messages"
              >
                <RotateCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <RotateCw className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
                <p>Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">No messages yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Send a message below to communicate directly with your faculty mentor or coordinator.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
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
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 font-medium">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            {sendError && (
              <p className="text-xs text-rose-500 mb-2 font-medium">{sendError}</p>
            )}
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
                disabled={!newMessage.trim() || (!activeConvId && !activeInternship?.mentorUserId)}
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
