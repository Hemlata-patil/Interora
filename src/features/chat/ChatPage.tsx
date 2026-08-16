import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Card, Badge, EmptyState, Button } from '@/components';
import { chatService } from './services/chatService';
import type { Mentor, Conversation, ChatMessage, StudentChatContextData } from './types/chat';
import { MentorList } from './components/MentorList';
import { ConversationHeader } from './components/ConversationHeader';
import { MessageBubble } from './components/MessageBubble';
import { MessageComposer } from './components/MessageComposer';
import { ChatQuickActions } from './components/ChatQuickActions';
import { ChatContextCard } from './components/ChatContextCard';
import { MessageCircle, Users, GraduationCap, Building2, HelpCircle, Loader2 } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const studentId = 'student_alex_01';

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [chatContext, setChatContext] = useState<StudentChatContextData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);

  // Load mentors, conversations, and student context
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [loadedMentors, loadedConversations, context] = await Promise.all([
          chatService.getAssignedMentors(studentId),
          chatService.getConversations(studentId),
          chatService.getStudentChatContext(studentId),
        ]);

        setMentors(loadedMentors);
        setConversations(loadedConversations);
        setChatContext(context);

        if (loadedMentors.length > 0) {
          setSelectedMentorId(loadedMentors[0].id);
        }
      } catch (err) {
        console.error('Error loading chat data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Selected mentor object
  const activeMentor = useMemo(
    () => mentors.find((m) => m.id === selectedMentorId) || null,
    [mentors, selectedMentorId]
  );

  // Selected conversation object
  const activeConversation = useMemo(
    () => conversations.find((c) => c.mentorId === selectedMentorId) || null,
    [conversations, selectedMentorId]
  );

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const msgList = await chatService.getMessages(activeConversation.id);
        setMessages(msgList);
        await chatService.markConversationAsRead(activeConversation.id);

        // Update local unread count
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
        );
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    loadMessages();
  }, [activeConversation?.id]);

  const handleSelectMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setShowMobileChat(true);
  };

  const handleSendMessage = async (text: string) => {
    if (!activeConversation) return;

    try {
      const sentMsg = await chatService.sendMessage(activeConversation.id, text);
      setMessages((prev) => [...prev, sentMsg]);

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, lastMessage: text, lastMessageAt: sentMsg.timestamp }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handlePromptSelect = (promptText: string) => {
    setDraftMessage(promptText);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mentor Connect"
          description="Get guidance from the mentors supporting your internship and career journey."
        />
        <Card>
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Connecting to your assigned mentors...</h4>
          </div>
        </Card>
      </div>
    );
  }

  // Handle case where student has no assigned mentors
  if (mentors.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mentor Connect"
          description="Get guidance from the mentors supporting your internship and career journey."
        />
        <EmptyState
          icon={<Users className="w-8 h-8 text-slate-400" />}
          title="No Mentor Assigned Yet"
          description="Your mentor assignment has not been completed yet. Once a Faculty or Industry Mentor is assigned, you will be able to communicate with them here. No action is required right now."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Mentor Connect"
        description="Get guidance from the mentors supporting your internship and career journey."
      />

      {/* 2. Top Smart Guidance Scenario Banner Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Faculty Help Scenario */}
        <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-indigo-950">Need Help Finding the Right Internship?</h4>
          </div>
          <p className="text-slate-600 text-[11px]">
            Your Faculty Mentor can help you identify skill roadmaps, target roles, and application improvements.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const fac = mentors.find((m) => m.type === 'FACULTY');
              if (fac) {
                handleSelectMentor(fac.id);
                setDraftMessage(
                  'I am having difficulty finding a suitable internship. Can you help me understand which skills I should improve and which internship roles I should target?'
                );
              }
            }}
            className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white"
          >
            Ask Faculty Mentor â†’
          </Button>
        </div>

        {/* Industry Help Scenario */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-emerald-950">Preparing for Industry Expectations?</h4>
          </div>
          <p className="text-slate-600 text-[11px]">
            Ask your Industry Mentor about technical standards, production project quality, and interview prep.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ind = mentors.find((m) => m.type === 'INDUSTRY');
              if (ind) {
                handleSelectMentor(ind.id);
                setDraftMessage(
                  'How can I improve my technical React/TypeScript project to meet industry production standards for technical interviews?'
                );
              }
            }}
            className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white"
          >
            Ask Industry Mentor â†’
          </Button>
        </div>
      </div>

      {/* 3. Main Chat Workspace Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[560px]">
        {/* Left Column: Mentor & Conversation List */}
        <div className={`border-r border-slate-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Your Assigned Mentors</h3>
            <Badge variant="indigo">{mentors.length} Mentors</Badge>
          </div>

          <div className="flex-1 overflow-y-auto">
            <MentorList
              mentors={mentors}
              conversations={conversations}
              selectedMentorId={selectedMentorId}
              onSelectMentor={handleSelectMentor}
            />
          </div>

          {chatContext && (
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">
                Connected as <strong className="text-slate-800">{chatContext.studentName}</strong> â€¢ {chatContext.targetRole}
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Active Conversation Area */}
        <div className={`col-span-2 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {activeMentor ? (
            <>
              {/* Header */}
              <ConversationHeader
                mentor={activeMentor}
                onBackMobile={() => setShowMobileChat(false)}
              />

              {/* Quick Guidance Actions */}
              <ChatQuickActions
                activeMentorType={activeMentor.type}
                onSelectPrompt={handlePromptSelect}
              />

              {/* Message List */}
              <div className="flex-1 p-4 bg-slate-50/50 overflow-y-auto space-y-3 min-h-[320px]">
                {messages.length > 0 ? (
                  messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <MessageCircle className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Start the Conversation</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Ask your mentor about your skills, internship, project, interview preparation, or career goals.
                    </p>
                  </div>
                )}
              </div>

              {/* Message Composer */}
              <MessageComposer
                onSendMessage={handleSendMessage}
                draftMessage={draftMessage}
                onDraftChange={setDraftMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a mentor to start communicating
            </div>
          )}
        </div>
      </div>

      {/* 4. Context Summary Card for Mentor Reference */}
      {chatContext && <ChatContextCard contextData={chatContext} />}
    </div>
  );
};