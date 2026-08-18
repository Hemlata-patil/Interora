import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PageHeader, Card, StatCard, Badge, Button, Input } from '@/components';
import { 
  mockFacultyStudents, 
  mockGuidanceConversations, 
  setMockGuidanceConversations,
  mockCompanyInternships
} from './mockData';
import type { 
  SharedStudentData, 
  GuidanceConversation, 
  GuidanceMessage,
  GuidanceStatus
} from './mockData';
import { MessageCircle, Search, Send, CheckCircle2, AlertCircle, Clock, Check, X, UserCircle2 } from 'lucide-react';

const MOCK_FACULTY_ID = 'fac-1';

export const StudentGuidance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<GuidanceConversation[]>(mockGuidanceConversations);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter students who need guidance
  const guidanceStudents = useMemo(() => {
    return mockFacultyStudents.filter(s => 
      ['Rejected', 'Needs Improvement', 'Pending Guidance'].includes(s.applicationStatus)
    );
  }, []);

  const filteredStudents = useMemo(() => {
    return guidanceStudents.filter(s => 
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guidanceStudents, searchTerm]);

  // Derived stats
  const totalRequests = guidanceStudents.length;
  
  // Unread = conversation exists and last message is from student and not read
  const unreadCount = guidanceStudents.filter(s => {
    const conv = conversations.find(c => c.studentId === s.id);
    if (!conv || conv.messages.length === 0) return false;
    const lastMsg = conv.messages[conv.messages.length - 1];
    return lastMsg.senderRole === 'Student' && !lastMsg.read;
  }).length;

  const awaitingFaculty = conversations.filter(c => c.status === 'Awaiting Faculty Reply').length;
  const resolvedCount = conversations.filter(c => c.status === 'Resolved').length;

  // Selected state
  const selectedStudent = useMemo(() => 
    guidanceStudents.find(s => s.id === selectedStudentId) || null
  , [guidanceStudents, selectedStudentId]);

  const currentConversation = useMemo(() => {
    if (!selectedStudent) return null;
    return conversations.find(c => c.studentId === selectedStudent.id) || null;
  }, [selectedStudent, conversations]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages.length, selectedStudentId]);

  const handleOpenChat = (studentId: string) => {
    setSelectedStudentId(studentId);
    
    // Mark as read if the last message was from student
    const updatedConvs = conversations.map(c => {
      if (c.studentId === studentId) {
        const msgs = c.messages.map(m => {
          if (m.senderRole === 'Student' && !m.read) {
            return { ...m, read: true };
          }
          return m;
        });
        return { ...c, messages: msgs };
      }
      return c;
    });
    setConversations(updatedConvs);
    setMockGuidanceConversations(updatedConvs);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;

    let conv = currentConversation;
    const date = new Date().toISOString();
    
    const msg: GuidanceMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'Faculty',
      senderId: MOCK_FACULTY_ID,
      message: newMessage.trim(),
      timestamp: date,
      read: true
    };

    let updatedConvs: GuidanceConversation[];

    if (conv) {
      // Update existing conversation
      const updatedConv: GuidanceConversation = {
        ...conv,
        status: 'Awaiting Student Reply',
        messages: [...conv.messages, msg]
      };
      updatedConvs = conversations.map(c => c.id === conv?.id ? updatedConv : c);
    } else {
      // Create new conversation (Student might not have started it)
      // We will need internshipId for this student's application. Since our mockData structure
      // relies on mockCompanyApplications, we will just use a generic or derive it.
      // Wait, mockCompanyApplications associates student with internship.
      // For simplicity in UI, we can just map it from their 'company' or a default if not found.
      const newConv: GuidanceConversation = {
        id: `guidance-${Date.now()}`,
        studentId: selectedStudent.id,
        internshipId: 'int-1', // Generic for mock
        status: 'Awaiting Student Reply',
        messages: [msg]
      };
      updatedConvs = [...conversations, newConv];
    }

    setConversations(updatedConvs);
    setMockGuidanceConversations(updatedConvs);
    setNewMessage('');
  };

  const handleMarkResolved = () => {
    if (!currentConversation) return;

    const updatedConvs = conversations.map(c => {
      if (c.id === currentConversation.id) {
        return { ...c, status: 'Resolved' as GuidanceStatus };
      }
      return c;
    });

    setConversations(updatedConvs);
    setMockGuidanceConversations(updatedConvs);
  };

  const getStatusBadge = (status: GuidanceStatus | undefined) => {
    if (!status) return <Badge variant="neutral">Not Started</Badge>;
    switch (status) {
      case 'Awaiting Faculty Reply': return <Badge variant="rose"><AlertCircle className="w-3 h-3 mr-1" /> Awaiting Reply</Badge>;
      case 'Awaiting Student Reply': return <Badge variant="amber"><Clock className="w-3 h-3 mr-1" /> Awaiting Student</Badge>;
      case 'In Progress': return <Badge variant="indigo"><MessageCircle className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'Resolved': return <Badge variant="emerald"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <PageHeader
        title="Student Guidance"
        description="Guide students who need additional preparation before internship approval."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Guidance Requests" value={totalRequests.toString()} icon={MessageCircle} />
        <StatCard title="Unread" value={unreadCount.toString()} icon={AlertCircle} trend={unreadCount > 0 ? { value: 'Needs Attention', isPositive: false } : undefined} />
        <StatCard title="Awaiting Faculty Reply" value={awaitingFaculty.toString()} icon={Clock} />
        <StatCard title="Resolved" value={resolvedCount.toString()} icon={CheckCircle2} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Student List Sidebar */}
        <Card className="w-full lg:w-1/3 flex flex-col h-full shadow-sm overflow-hidden p-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 mb-3">Students Needing Guidance</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const conv = conversations.find(c => c.studentId === student.id);
                  const isSelected = selectedStudentId === student.id;
                  const lastMsg = conv?.messages[conv.messages.length - 1];
                  const hasUnread = lastMsg?.senderRole === 'Student' && !lastMsg.read;

                  return (
                    <div 
                      key={student.id}
                      onClick={() => handleOpenChat(student.id)}
                      className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'} relative`}
                    >
                      {hasUnread && (
                        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                      )}
                      <div className="flex items-start justify-between mb-1 pr-4">
                        <h4 className="font-semibold text-slate-900 text-sm">{student.studentName}</h4>
                        <span className="text-[10px] text-slate-500">{lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 truncate">{student.role} @ {student.company}</p>
                      
                      <div className="flex flex-wrap gap-2 items-center justify-between mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${student.applicationStatus === 'Needs Improvement' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {student.applicationStatus}
                        </span>
                        {getStatusBadge(conv?.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <MessageCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No students currently require guidance.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="w-full lg:w-2/3 flex flex-col h-full shadow-sm p-0 overflow-hidden bg-slate-50/30">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {selectedStudent.studentName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">{selectedStudent.studentName}</h2>
                    <p className="text-xs text-slate-500">{selectedStudent.role} @ {selectedStudent.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${selectedStudent.applicationStatus === 'Needs Improvement' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    App: {selectedStudent.applicationStatus}
                  </span>
                  {currentConversation?.status !== 'Resolved' && currentConversation?.messages.length ? (
                    <Button variant="outline" size="sm" onClick={handleMarkResolved}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                    </Button>
                  ) : currentConversation?.status === 'Resolved' ? (
                    <Badge variant="emerald"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolved</Badge>
                  ) : null}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!currentConversation || currentConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <MessageCircle className="w-12 h-12 text-slate-200 mb-3" />
                    <p className="text-sm font-medium text-slate-700">No messages yet.</p>
                    <p className="text-xs mt-1">Send guidance to start the conversation.</p>
                  </div>
                ) : (
                  currentConversation.messages.map((msg, index) => {
                    const isFaculty = msg.senderRole === 'Faculty';
                    return (
                      <div key={msg.id} className={`flex w-full ${isFaculty ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${isFaculty ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${isFaculty ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            {isFaculty ? 'F' : selectedStudent.studentName.charAt(0)}
                          </div>
                          <div className={`flex flex-col ${isFaculty ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-700">{isFaculty ? 'You (Faculty)' : selectedStudent.studentName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${isFaculty ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    placeholder={currentConversation?.status === 'Resolved' ? "Conversation resolved. Type to reopen..." : "Type your guidance..."}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="shrink-0 px-6 rounded-xl">
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
              <UserCircle2 className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-1">Select a Student</h3>
              <p className="text-sm">Choose a student from the list to view their application guidance chat.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
