import type { Mentor, Conversation, ChatMessage, StudentChatContextData } from '../types/chat';

export const mockFacultyMentorRecord: Mentor = {
  id: 'faculty_mentor_01',
  name: 'Dr. Rajesh Sharma',
  type: 'FACULTY',
  designation: 'Faculty Mentor & Academic Advisor',
  avatarInitials: 'RS',
  status: 'ONLINE',
  expertise: ['Academic Progress', 'Skill Development', 'Career Guidance'],
  isAssigned: true,
  institutionOrCompany: 'GHR Institute of Technology',
};

export const mockIndustryMentorRecord: Mentor = {
  id: 'industry_mentor_01',
  name: 'Sarah Jenkins',
  type: 'INDUSTRY',
  designation: 'Senior Technical Lead & Host Mentor',
  avatarInitials: 'SJ',
  status: 'ONLINE',
  expertise: ['Full Stack Development', 'Code Reviews', 'Sprint Tasks'],
  isAssigned: true,
  institutionOrCompany: 'TechCorp Solutions',
};

export const mockMentors: Mentor[] = [mockFacultyMentorRecord, mockIndustryMentorRecord];

export const getStudentMentors = (isIntern: boolean = true): Mentor[] => {
  if (!isIntern) {
    return [mockFacultyMentorRecord];
  }
  return [mockFacultyMentorRecord, mockIndustryMentorRecord];
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv_01',
    mentorId: 'faculty_mentor_01',
    studentId: 'std_101',
    lastMessage: 'Great progress on your React components!',
    lastMessageAt: '10:30 AM',
    unreadCount: 1,
  },
  {
    id: 'conv_02',
    mentorId: 'industry_mentor_01',
    studentId: 'std_101',
    lastMessage: 'Sprint 3 tasks look good. Keep it up.',
    lastMessageAt: 'Yesterday',
    unreadCount: 0,
  },
];

export const mockInitialMessages: ChatMessage[] = [
  {
    id: 'msg_01',
    conversationId: 'conv_01',
    senderId: 'faculty_mentor_01',
    senderType: 'MENTOR',
    message: 'Hello Alex! Welcome to your mentor connect workspace.',
    timestamp: '10:15 AM',
    status: 'READ',
    isRead: true,
  },
  {
    id: 'msg_02',
    conversationId: 'conv_01',
    senderId: 'std_101',
    senderType: 'STUDENT',
    message: 'Thank you Dr. Sharma. I have updated my weekly work log.',
    timestamp: '10:20 AM',
    status: 'READ',
    isRead: true,
  },
];

export const mockStudentChatContext: StudentChatContextData = {
  studentName: 'Alex Johnson',
  targetRole: 'Full Stack React Developer',
  attendancePercentage: 92,
  taskCompletionPercentage: 85,
  milestoneCompletionPercentage: 50,
  careerPrepPercentage: 70,
  keySkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
};