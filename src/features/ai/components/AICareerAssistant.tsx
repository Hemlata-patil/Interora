import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot,
  Send,
  User,
  Loader2,
  X,
  RotateCcw,
  History,
  Plus,
  Pencil,
  Trash2,
  Check,
  ChevronLeft,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import botAvatar from '@/assets/ai_bot_avatar.jpg';
import type { CareerAnalysisInput, ChatMessage } from '../types/aiCareer';
import { sendAICareerMessage } from '../services/aiCareerService';
import {
  getCurrentUserBackend,
  fetchActiveStudentInternshipBackend,
} from '@/services/api/backendService';

export interface AICareerAssistantProps {
  input?: CareerAnalysisInput;
  initialOpen?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const SESSIONS_STORAGE_KEY = 'interora_ai_chat_sessions_v2';
const LEGACY_STORAGE_KEY = 'interora_ai_chat_history';

const STARTER_PROMPTS = [
  'What skills should I focus on next?',
  'How can I improve my internship performance?',
  'What project ideas would boost my career readiness?',
  'Tips for my next mentor 1:1 evaluation',
];

// Single-instance guard to ensure only one floating widget mounts in the DOM
let activeChatInstanceId: string | null = null;

function buildDefaultCareerInput(user: any, active: any): CareerAnalysisInput {
  const sp = user?.studentProfile;
  const rawSkills: string[] = [];
  if (Array.isArray(sp?.skills)) {
    for (const s of sp.skills) {
      if (typeof s === 'string' && s.trim()) rawSkills.push(s.trim());
      else if (s && typeof s.name === 'string' && s.name.trim()) rawSkills.push(s.name.trim());
    }
  }

  return {
    student: {
      name: user?.fullName?.trim() || 'Student',
      education: sp?.course
        ? `${sp.course} (${sp.currentSemester ? `Semester ${sp.currentSemester}` : 'Active Student'})`
        : 'Engineering Student',
      targetCareer: 'Full Stack Software Engineer',
    },
    skills: {
      technical: rawSkills.length > 0 ? rawSkills : ['Software Development', 'Problem Solving'],
      tools: ['Git', 'VS Code', 'GitHub'],
      languages: ['JavaScript', 'TypeScript', 'Python'],
    },
    internship: {
      role: active?.title?.trim() || 'Software Engineering Intern',
      company: active?.companyName?.trim() || 'Partner Organization',
      workMode: active?.workMode || 'Remote',
      duration: active?.duration || '3 Months',
    },
    performance: {
      attendancePercentage: 92,
      taskCompletionPercentage: 85,
      milestoneCompletionPercentage: 80,
      mentorEvaluationScore: 88,
      totalHoursLogged: 120,
    },
    milestones: {
      completedCount: 2,
      totalCount: 3,
      currentMilestoneTitle: 'Sprint Delivery',
    },
    evaluations: {
      technicalSkillsScore: 88,
      problemSolvingScore: 85,
      communicationScore: 90,
      professionalismScore: 92,
      mentorFeedback: 'Consistent performer with great problem solving skills and technical adaptability.',
      strengths: ['Code Quality', 'Proactive Communication'],
      improvementAreas: ['System Design'],
    },
  };
}

function createInitialSession(studentName: string, targetCareer: string): ChatSession {
  const now = Date.now();
  return {
    id: `sess_${now}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'Career Roadmap & Guidance',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: 'm_init',
        sender: 'assistant',
        text: `Hello ${studentName}! I am your Interora AI Career Advisor. Ask me anything about your internship tasks, skill improvement, project roadmaps, or preparation for ${targetCareer}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };
}

function formatSessionDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export const AICareerAssistant: React.FC<AICareerAssistantProps> = ({
  input: propInput,
  initialOpen = false,
}) => {
  const [instanceId] = useState(() => `chat_${Math.random().toString(36).substring(2, 9)}`);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');

  const [customInput, setCustomInput] = useState<CareerAnalysisInput | null>(null);
  const [resolvedInput, setResolvedInput] = useState<CareerAnalysisInput>(() => {
    return (
      propInput || {
        student: { name: 'Student', education: 'Engineering Student', targetCareer: 'Full Stack Software Engineer' },
        skills: { technical: ['Software Development'], tools: ['Git'], languages: ['TypeScript'] },
        internship: { role: 'Software Intern', company: 'Partner Organization', workMode: 'Remote', duration: '3 Months' },
        performance: { attendancePercentage: 92, taskCompletionPercentage: 85, milestoneCompletionPercentage: 80, mentorEvaluationScore: 88, totalHoursLogged: 120 },
        milestones: { completedCount: 2, totalCount: 3 },
        evaluations: { technicalSkillsScore: 88, problemSolvingScore: 85, communicationScore: 90, professionalismScore: 92, mentorFeedback: 'Great participation.', strengths: ['Problem Solving'], improvementAreas: ['Architecture'] },
      }
    );
  });

  // Sessions State (ChatGPT style multiple conversation threads)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Migrate from single legacy history if present
      const legacy = sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const legacyMsgs = JSON.parse(legacy);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          return [
            {
              id: `sess_legacy_${Date.now()}`,
              title: 'Previous Consultation',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: legacyMsgs,
            },
          ];
        }
      }
    } catch {
      // Ignore
    }
    return [createInitialSession(propInput?.student.name || 'there', propInput?.student.targetCareer || 'Full Stack Engineer')];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || `sess_${Date.now()}`;
  });

  // Rename session state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>('');
  const [isHeaderRenaming, setIsHeaderRenaming] = useState<boolean>(false);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Active Session reference
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: 'fallback',
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };

  const messages = activeSession.messages;

  // Enforce single-instance guard
  useEffect(() => {
    if (!activeChatInstanceId) {
      activeChatInstanceId = instanceId;
    } else if (activeChatInstanceId !== instanceId) {
      setIsDuplicate(true);
      return;
    }

    return () => {
      if (activeChatInstanceId === instanceId) {
        activeChatInstanceId = null;
      }
    };
  }, [instanceId]);

  // Load student profile & active internship details if not supplied via props
  useEffect(() => {
    if (propInput) {
      setResolvedInput(propInput);
      return;
    }

    let isMounted = true;
    const fetchContext = async () => {
      try {
        const [user, active] = await Promise.all([
          getCurrentUserBackend().catch(() => null),
          fetchActiveStudentInternshipBackend().catch(() => null),
        ]);
        if (!isMounted) return;

        if (user) {
          const fallback = buildDefaultCareerInput(user, active);
          setResolvedInput(fallback);

          // Update initial message if first session is still default
          setSessions((prev) => {
            if (prev.length === 1 && prev[0].messages.length === 1 && prev[0].messages[0].id === 'm_init') {
              const updatedSession: ChatSession = {
                ...prev[0],
                messages: [
                  {
                    ...prev[0].messages[0],
                    text: `Hello ${user.fullName?.split(' ')[0] || user.fullName}! I am your Interora AI Career Advisor. Ask me anything about your internship tasks, skill improvement, project roadmaps, or preparation for ${fallback.student.targetCareer}.`,
                  },
                ],
              };
              return [updatedSession];
            }
            return prev;
          });
        }
      } catch {
        // Fallback is already initialized
      }
    };

    fetchContext();
    return () => {
      isMounted = false;
    };
  }, [propInput]);

  // Update input if customInput changes
  useEffect(() => {
    if (customInput) {
      setResolvedInput(customInput);
    }
  }, [customInput]);

  // Persist sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      } catch {
        // Ignore storage errors
      }
    }
  }, [sessions]);

  // Listen for global custom events to open the chat or update career input
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setViewMode('chat');
    };
    const handleClose = () => setIsOpen(false);
    const handleSetInput = (e: Event) => {
      const customEvent = e as CustomEvent<CareerAnalysisInput>;
      if (customEvent.detail) {
        setCustomInput(customEvent.detail);
      }
    };

    window.addEventListener('open-interora-ai-chat', handleOpen);
    window.addEventListener('close-interora-ai-chat', handleClose);
    window.addEventListener('interora-set-career-input', handleSetInput as EventListener);

    return () => {
      window.removeEventListener('open-interora-ai-chat', handleOpen);
      window.removeEventListener('close-interora-ai-chat', handleClose);
      window.removeEventListener('interora-set-career-input', handleSetInput as EventListener);
    };
  }, []);

  // Keyboard escape listener to close panel or cancel renaming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingSessionId || isHeaderRenaming) {
          setEditingSessionId(null);
          setIsHeaderRenaming(false);
        } else if (viewMode === 'history') {
          setViewMode('chat');
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, editingSessionId, isHeaderRenaming]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, viewMode, isLoading]);

  // Auto-focus chat input when panel opens in chat mode
  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, viewMode, activeSessionId]);

  // Auto-focus rename input when entering rename mode
  useEffect(() => {
    if (editingSessionId || isHeaderRenaming) {
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 50);
    }
  }, [editingSessionId, isHeaderRenaming]);

  // Helper: Create a New Chat Session
  const handleCreateNewChat = useCallback(() => {
    const studentName = resolvedInput.student.name || 'there';
    const targetCareer = resolvedInput.student.targetCareer || 'your chosen career track';
    const newSession = createInitialSession(studentName, targetCareer);

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setViewMode('chat');
    setIsHeaderRenaming(false);
    setEditingSessionId(null);
    setInputQuery('');
  }, [resolvedInput]);

  // Helper: Start Renaming
  const handleStartRename = (sessionId: string, currentTitle: string, isFromHeader = false) => {
    setEditingSessionId(sessionId);
    setRenameInputValue(currentTitle);
    setIsHeaderRenaming(isFromHeader);
  };

  // Helper: Save Renamed Title
  const handleSaveRename = (sessionId: string) => {
    const trimmed = renameInputValue.trim();
    if (!trimmed) {
      setEditingSessionId(null);
      setIsHeaderRenaming(false);
      return;
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed, updatedAt: Date.now() } : s))
    );
    setEditingSessionId(null);
    setIsHeaderRenaming(false);
  };

  // Helper: Delete a Session
  const handleDeleteSession = (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const studentName = resolvedInput.student.name || 'there';
        const targetCareer = resolvedInput.student.targetCareer || 'Full Stack Engineer';
        const fresh = createInitialSession(studentName, targetCareer);
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });

    if (editingSessionId === sessionId) {
      setEditingSessionId(null);
      setIsHeaderRenaming(false);
    }
  };

  // Helper: Clear Active Session Messages
  const handleClearActiveSession = () => {
    const studentName = resolvedInput.student.name || 'there';
    const resetMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'assistant',
      text: `Chat cleared. Hello ${studentName}! How can I assist you with your career or internship today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [resetMsg], updatedAt: Date.now() } : s
      )
    );
  };

  // Send Query to Real Groq AI Backend
  const handleSendQuery = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [...messages, userMsg];

      // Auto-generate a smart title from the first question if default title
      const currentTitle = activeSession.title;
      let newTitle = currentTitle;
      if (
        currentTitle === 'Career Roadmap & Guidance' ||
        currentTitle === 'New Chat' ||
        currentTitle.startsWith('New Career')
      ) {
        newTitle = trimmed.length > 32 ? `${trimmed.substring(0, 32).trim()}...` : trimmed;
      }

      // Update session with user message immediately
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, title: newTitle, messages: updatedHistory, updatedAt: Date.now() }
            : s
        )
      );

      setInputQuery('');
      setIsLoading(true);

      try {
        const replyText = await sendAICareerMessage(resolvedInput, trimmed, updatedHistory);
        const botMsg: ChatMessage = {
          id: `b_${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedHistory, botMsg], updatedAt: Date.now() }
              : s
          )
        );
      } catch (error: any) {
        const errMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text:
            error?.message ||
            'I experienced a connection issue while contacting the AI Career service. Please check your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedHistory, errMsg], updatedAt: Date.now() }
              : s
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, resolvedInput, activeSessionId, activeSession.title]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuery(inputQuery);
  };

  // If duplicate instance detected, do not render to avoid duplicate widgets
  if (isDuplicate) {
    return null;
  }

  return (
    <>
      {/* ── Expandable Floating Chat Panel ── */}
      <div
        role="dialog"
        aria-label="Interora AI Career Advisor"
        aria-modal="false"
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[430px] h-[540px] max-h-[calc(100vh-6.5rem)] sm:max-h-[600px] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-3 pointer-events-none'
        }`}
      >
        {/* ── VIEW 1: HISTORY DRAWER / SESSION MANAGER (ChatGPT Style) ── */}
        {viewMode === 'history' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* History Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setViewMode('chat')}
                  title="Back to conversation"
                  aria-label="Back to conversation"
                  className="p-1 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-indigo-200" />
                  <h3 className="text-sm font-semibold">Chat History</h3>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">
                    {sessions.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleCreateNewChat}
                  title="Start a new chat"
                  aria-label="Start a new chat"
                  className="px-2.5 py-1 text-xs font-semibold bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg shadow-xs transition-colors flex items-center space-x-1 focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close AI Assistant"
                  aria-label="Close AI Assistant"
                  className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-[11px] font-medium text-slate-400 px-1 uppercase tracking-wider">
                Saved Conversations
              </div>

              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = editingSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (!isEditing) {
                        setActiveSessionId(session.id);
                        setViewMode('chat');
                      }
                    }}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 border-indigo-200 shadow-xs ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/80 shadow-xs'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Rename Input inside History Card */
                      <div
                        className="flex items-center space-x-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameInputValue}
                          onChange={(e) => setRenameInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id);
                            if (e.key === 'Escape') setEditingSessionId(null);
                          }}
                          placeholder="Conversation title..."
                          className="flex-1 px-2 py-1 text-xs bg-white border border-indigo-400 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(session.id)}
                          title="Save title"
                          aria-label="Save title"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSessionId(null)}
                          title="Cancel"
                          aria-label="Cancel renaming"
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Conversation Item Display */
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <MessageSquare
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <h4
                                className={`text-xs font-semibold truncate leading-snug ${
                                  isActive ? 'text-indigo-900' : 'text-slate-800'
                                }`}
                              >
                                {session.title}
                              </h4>
                              {isActive && (
                                <span className="text-[9px] bg-indigo-600 text-white font-medium px-1.5 py-0.2 rounded-full shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {session.messages.length} message
                              {session.messages.length === 1 ? '' : 's'} •{' '}
                              {formatSessionDate(session.updatedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons (Rename & Delete) */}
                        <div
                          className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleStartRename(session.id, session.title, false)}
                            title="Rename chat"
                            aria-label={`Rename chat ${session.title}`}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            title="Delete chat"
                            aria-label={`Delete chat ${session.title}`}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Bar in History View */}
            <div className="p-3 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="text-[11px]">Chat history is saved locally</span>
              <button
                type="button"
                onClick={() => setViewMode('chat')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Return to chat →
              </button>
            </div>
          </div>
        ) : (
          /* ── VIEW 2: ACTIVE CHAT CONVERSATION VIEW ── */
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
                {/* History Drawer Toggle Button */}
                <button
                  type="button"
                  onClick={() => setViewMode('history')}
                  title="View chat history"
                  aria-label="View chat history"
                  className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-1 shrink-0 focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <History className="w-4 h-4" />
                  <span className="text-[10px] font-mono bg-white/20 px-1 py-0.2 rounded-full">
                    {sessions.length}
                  </span>
                </button>

                {/* Bot Avatar Icon in Header */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/40 shadow-xs">
                  <img src={botAvatar} alt="Interora AI Bot" className="w-full h-full object-cover" />
                </div>

                {/* Editable Title or Display */}
                {isHeaderRenaming ? (
                  <div className="flex items-center space-x-1 flex-1 min-w-0">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameInputValue}
                      onChange={(e) => setRenameInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(activeSession.id);
                        if (e.key === 'Escape') setIsHeaderRenaming(false);
                      }}
                      className="w-full px-2 py-0.5 text-xs text-slate-900 bg-white rounded-md border border-white focus:outline-hidden"
                      placeholder="Enter chat title..."
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(activeSession.id)}
                      title="Save"
                      className="p-1 text-white hover:bg-white/10 rounded-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHeaderRenaming(false)}
                      title="Cancel"
                      className="p-1 text-indigo-100 hover:bg-white/10 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <h3
                        className="text-xs sm:text-sm font-semibold truncate leading-tight cursor-pointer hover:underline"
                        title="Click to rename chat"
                        onClick={() => handleStartRename(activeSession.id, activeSession.title, true)}
                      >
                        {activeSession.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleStartRename(activeSession.id, activeSession.title, true)}
                        title="Rename this conversation"
                        aria-label="Rename this conversation"
                        className="p-0.5 text-indigo-200 hover:text-white transition-colors shrink-0"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-indigo-100/80">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                      <span className="truncate">Interora AI Advisor • Groq</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: New Chat, Clear, Close */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCreateNewChat}
                  title="New chat"
                  aria-label="Start new chat"
                  className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearActiveSession}
                  title="Clear conversation messages"
                  aria-label="Clear conversation messages"
                  className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close AI Assistant"
                  aria-label="Close AI Assistant"
                  className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-hidden focus:ring-1 focus:ring-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Student Context Pill */}
            <div className="px-3.5 py-1.5 bg-indigo-50/70 border-b border-indigo-100/60 flex items-center justify-between text-[10px] text-indigo-900 shrink-0">
              <span className="truncate">
                Student: <strong className="font-semibold">{resolvedInput.student.name}</strong> •{' '}
                <span className="text-indigo-700">{resolvedInput.student.targetCareer || 'Career Track'}</span>
              </span>
              <button
                type="button"
                onClick={() => setViewMode('history')}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-[10px] shrink-0 ml-2 hover:underline flex items-center gap-0.5"
              >
                <span>All Chats</span>
                <span>({sessions.length})</span>
              </button>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-indigo-200 shadow-xs">
                      <img src={botAvatar} alt="AI" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl leading-relaxed text-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs whitespace-pre-line'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-1.5 ${
                        msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-indigo-600 bg-white border border-slate-200/70 rounded-xl p-2.5 max-w-[80%] shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[11px] font-medium text-slate-600">AI Advisor is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter Suggestion Chips (shown when chat is new or clean) */}
            {messages.length <= 1 && (
              <div className="px-3 pt-2 pb-1.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-400 w-full font-medium">Quick questions:</span>
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendQuery(prompt)}
                    disabled={isLoading}
                    className="text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-slate-700 px-2.5 py-1 rounded-full text-left transition-colors truncate max-w-full"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-white border-t border-slate-200/80 flex items-center space-x-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask AI Advisor about your career..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                aria-label="Send Message"
                className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center shrink-0 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Circular Floating Launcher Button with Levitation & Glow Animations ── */}
      <div
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center group ${
          !isOpen ? 'animate-floating' : ''
        }`}
      >
        {/* Subtle tooltip pill that appears on hover when closed */}
        {!isOpen && (
          <div className="absolute right-16 sm:right-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium rounded-xl shadow-2xl border border-indigo-500/30 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Ask Interora AI</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          aria-expanded={isOpen}
          title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus:outline-hidden focus:ring-4 focus:ring-indigo-300 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 text-white rotate-90 scale-95 shadow-slate-900/40'
              : 'hover:scale-110 active:scale-95 animate-glow ring-4 ring-indigo-500/40'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform text-white" />
          ) : (
            <div className="relative w-full h-full rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600">
              <img
                src={botAvatar}
                alt="Interora AI Assistant"
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20"></span>
              </span>
            </div>
          )}
        </button>
      </div>
    </>
  );
};