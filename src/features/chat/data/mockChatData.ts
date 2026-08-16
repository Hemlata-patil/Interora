import type { Mentor, Conversation, ChatMessage, StudentChatContextData } from '../types/chat';

export const mockMentors: Mentor[] = [
  {
    id: 'mentor_fac_01',
    name: 'Dr. Rajesh Sharma',
    type: 'FACULTY',
    designation: 'Associate Professor & Academic Mentor',
    avatarInitials: 'RS',
    status: 'ONLINE',
    expertise: ['Career Guidance', 'Software Architecture', 'Placement Preparation', 'Skill Roadmaps'],
    isAssigned: true,
    institutionOrCompany: 'Department of Computer Science & Engineering',
  },
  {
    id: 'mentor_ind_01',
    name: 'Sarah Jenkins',
    type: 'INDUSTRY',
    designation: 'Senior Technical Lead & Host Mentor',
    avatarInitials: 'SJ',
    status: 'ONLINE',
    expertise: ['Full Stack Development', 'React & TypeScript', 'Interview Prep', 'Production Code Standards'],
    isAssigned: true,
    institutionOrCompany: 'TechCorp Solutions',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv_fac_01',
    mentorId: 'mentor_fac_01',
    studentId: 'student_alex_01',
    lastMessage: 'Let us review your core component milestone and skill roadmap this week.',
    lastMessageAt: '10:45 AM',
    unreadCount: 1,
  },
  {
    id: 'conv_ind_01',
    mentorId: 'mentor_ind_01',
    studentId: 'student_alex_01',
    lastMessage: 'Your latest React task state refactoring looks solid! Keep pushing updates.',
    lastMessageAt: 'Yesterday',
    unreadCount: 0,
  },
];

export const mockInitialMessages: Record<string, ChatMessage[]> = {
  conv_fac_01: [
    {
      id: 'm_fac_1',
      conversationId: 'conv_fac_01',
      senderId: 'mentor_fac_01',
      senderType: 'MENTOR',
      message: 'Hello Alex! I reviewed your recent milestone progress (53%) and attendance records (92%). You are doing great.',
      timestamp: 'Yesterday, 04:15 PM',
      status: 'READ',
      isRead: true,
    },
    {
      id: 'm_fac_2',
      conversationId: 'conv_fac_01',
      senderId: 'student_alex_01',
      senderType: 'STUDENT',
      message: 'Thank you Dr. Sharma! I am currently working on expanding my React and TypeScript interview preparation modules.',
      timestamp: 'Yesterday, 04:30 PM',
      status: 'READ',
      isRead: true,
    },
    {
      id: 'm_fac_3',
      conversationId: 'conv_fac_01',
      senderId: 'mentor_fac_01',
      senderType: 'MENTOR',
      message: 'Let us review your core component milestone and skill roadmap this week.',
      timestamp: '10:45 AM',
      status: 'DELIVERED',
      isRead: false,
    },
  ],
  conv_ind_01: [
    {
      id: 'm_ind_1',
      conversationId: 'conv_ind_01',
      senderId: 'mentor_ind_01',
      senderType: 'MENTOR',
      message: 'Hi Alex! Welcome to the TechCorp Solutions internship program. I will be your primary industry mentor.',
      timestamp: 'Aug 12, 09:00 AM',
      status: 'READ',
      isRead: true,
    },
    {
      id: 'm_ind_2',
      conversationId: 'conv_ind_01',
      senderId: 'student_alex_01',
      senderType: 'STUDENT',
      message: 'Excited to be working with you Sarah! I have submitted my work log and completed the assigned sprint tasks.',
      timestamp: 'Aug 13, 02:15 PM',
      status: 'READ',
      isRead: true,
    },
    {
      id: 'm_ind_3',
      conversationId: 'conv_ind_01',
      senderId: 'mentor_ind_01',
      senderType: 'MENTOR',
      message: 'Your latest React task state refactoring looks solid! Keep pushing updates.',
      timestamp: 'Yesterday',
      status: 'READ',
      isRead: true,
    },
  ],
};

export const mockStudentChatContext: StudentChatContextData = {
  studentName: 'Alex Johnson',
  targetRole: 'Full Stack Software Developer',
  attendancePercentage: 92,
  taskCompletionPercentage: 56,
  milestoneCompletionPercentage: 53,
  careerPrepPercentage: 20,
  keySkills: ['React.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'SQL'],
};