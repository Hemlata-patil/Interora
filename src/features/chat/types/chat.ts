export type MentorType = 'FACULTY' | 'INDUSTRY';
export type MentorStatus = 'ONLINE' | 'OFFLINE' | 'AWAY';
export type MessageStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type MessageSenderType = 'STUDENT' | 'MENTOR';

export interface Mentor {
  id: string;
  name: string;
  type: MentorType;
  designation: string;
  avatarInitials: string;
  status: MentorStatus;
  expertise: string[];
  lastSeen?: string;
  isAssigned: boolean;
  institutionOrCompany: string;
}

export interface Conversation {
  id: string;
  mentorId: string;
  studentId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: MessageSenderType;
  message: string;
  timestamp: string;
  status: MessageStatus;
  isRead: boolean;
}

export interface StudentChatContextData {
  studentName: string;
  targetRole: string;
  attendancePercentage: number;
  taskCompletionPercentage: number;
  milestoneCompletionPercentage: number;
  careerPrepPercentage: number;
  keySkills: string[];
}

export interface ChatService {
  getAssignedMentors(studentId: string): Promise<Mentor[]>;
  getConversations(studentId: string): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  sendMessage(conversationId: string, message: string): Promise<ChatMessage>;
  markConversationAsRead(conversationId: string): Promise<void>;
  getStudentChatContext(studentId: string): Promise<StudentChatContextData>;
}