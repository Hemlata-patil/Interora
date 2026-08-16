import type {
  ChatService,
  Mentor,
  Conversation,
  ChatMessage,
  StudentChatContextData,
} from '../types/chat';
import {
  mockMentors,
  mockConversations,
  mockInitialMessages,
  mockStudentChatContext,
} from '../data/mockChatData';

class MockChatProvider implements ChatService {
  private mentors: Mentor[] = [...mockMentors];
  private conversations: Conversation[] = [...mockConversations];
  private messages: Record<string, ChatMessage[]> = JSON.parse(JSON.stringify(mockInitialMessages));

  async getAssignedMentors(studentId: string): Promise<Mentor[]> {
    await new Promise((r) => setTimeout(r, 150));
    return this.mentors.filter((m) => m.isAssigned);
  }

  async getConversations(studentId: string): Promise<Conversation[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...this.conversations];
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...(this.messages[conversationId] || [])];
  }

  async sendMessage(conversationId: string, message: string): Promise<ChatMessage> {
    await new Promise((r) => setTimeout(r, 300));

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: 'student_alex_01',
      senderType: 'STUDENT',
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SENT',
      isRead: true,
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMsg);

    // Update conversation lastMessage preview
    const convIndex = this.conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex] = {
        ...this.conversations[convIndex],
        lastMessage: message,
        lastMessageAt: newMsg.timestamp,
      };
    }

    return newMsg;
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    const convIndex = this.conversations.findIndex((c) => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex].unreadCount = 0;
    }

    if (this.messages[conversationId]) {
      this.messages[conversationId] = this.messages[conversationId].map((m) => ({
        ...m,
        isRead: true,
        status: m.status === 'DELIVERED' ? 'READ' : m.status,
      }));
    }
  }

  async getStudentChatContext(studentId: string): Promise<StudentChatContextData> {
    await new Promise((r) => setTimeout(r, 100));
    return mockStudentChatContext;
  }
}

// Active service instance exported for UI
export const chatService: ChatService = new MockChatProvider();