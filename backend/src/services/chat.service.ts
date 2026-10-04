import { Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface UserContext {
  id: string;
  role: string;
}

export interface CreateConversationInput {
  participantIds: string[];
  initialMessage?: string;
}

export interface SendMessageInput {
  message: string;
}

export interface UpdateMessageInput {
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Projections
// ─────────────────────────────────────────────────────────────────────────────

const PARTICIPANT_SELECT = {
  id: true,
  conversationId: true,
  userId: true,
  lastReadAt: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  },
} as const;

const MESSAGE_SELECT = {
  id: true,
  conversationId: true,
  senderId: true,
  message: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  },
} as const;

const CONVERSATION_DETAIL_SELECT = {
  id: true,
  createdAt: true,
  updatedAt: true,
  participants: {
    select: PARTICIPANT_SELECT,
  },
  messages: {
    orderBy: { createdAt: 'asc' },
    select: MESSAGE_SELECT,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensures the caller is a participant in the specified conversation.
 */
export async function ensureConversationParticipant(
  conversationId: string,
  userId: string,
  role?: string
): Promise<void> {
  if (role === 'admin') return;

  const participant = await prisma.chatParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new AppError(403, 'You are not a participant in this conversation.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists conversations in which the user is a participant.
 */
export async function listUserConversations(user: UserContext) {
  const where: Prisma.ChatConversationWhereInput =
    user.role === 'admin'
      ? {}
      : {
          participants: {
            some: {
              userId: user.id,
            },
          },
        };

  return prisma.chatConversation.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      participants: {
        select: PARTICIPANT_SELECT,
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: MESSAGE_SELECT,
      },
    },
  });
}

/**
 * Gets conversation details with full message history and participants.
 */
export async function getConversationById(
  conversationId: string,
  user: UserContext
) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: CONVERSATION_DETAIL_SELECT,
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  if (!isParticipant && user.role !== 'admin') {
    throw new AppError(403, 'You are not authorized to view this conversation.');
  }

  return conversation;
}

/**
 * Gets chronological message history for a conversation.
 * Strictly verifies that the caller is a participant in the conversation.
 */
export async function getConversationMessages(
  conversationId: string,
  user: UserContext
) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  await ensureConversationParticipant(conversationId, user.id, user.role);

  return prisma.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: MESSAGE_SELECT,
  });
}

/**
 * Creates a new conversation and registers participants and an optional initial message.
 */
export async function createConversation(
  input: CreateConversationInput,
  user: UserContext
) {
  const rawParticipantIds = input.participantIds || [];
  const uniqueParticipantIds = Array.from(new Set([...rawParticipantIds, user.id]));

  if (uniqueParticipantIds.length < 2) {
    throw new AppError(400, 'A conversation requires at least two participants.');
  }

  // Validate that all participants exist in the Profile table
  const profiles = await prisma.profile.findMany({
    where: {
      id: { in: uniqueParticipantIds },
    },
    select: { id: true },
  });

  if (profiles.length !== uniqueParticipantIds.length) {
    throw new AppError(404, 'One or more specified participant user IDs do not exist.');
  }

  // If this is a direct 1-on-1 conversation, check if one already exists
  if (uniqueParticipantIds.length === 2) {
    const [p1, p2] = uniqueParticipantIds;
    const existingDirect = await prisma.chatConversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: p1 } } },
          { participants: { some: { userId: p2 } } },
        ],
      },
      select: CONVERSATION_DETAIL_SELECT,
    });

    if (existingDirect && existingDirect.participants.length === 2) {
      if (input.initialMessage && input.initialMessage.trim()) {
        await sendMessage(existingDirect.id, { message: input.initialMessage }, user);
        return getConversationById(existingDirect.id, user);
      }
      return existingDirect;
    }
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const conversation = await tx.chatConversation.create({
      data: {
        createdAt: now,
        updatedAt: now,
        participants: {
          create: uniqueParticipantIds.map((id) => ({
            userId: id,
            lastReadAt: id === user.id ? now : null,
            createdAt: now,
          })),
        },
      },
      select: { id: true },
    });

    if (input.initialMessage && input.initialMessage.trim()) {
      await tx.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          message: input.initialMessage.trim(),
          createdAt: now,
        },
      });
    }

    return tx.chatConversation.findUniqueOrThrow({
      where: { id: conversation.id },
      select: CONVERSATION_DETAIL_SELECT,
    });
  });
}

/**
 * Adds a new participant to an existing conversation.
 */
export async function addParticipantToConversation(
  conversationId: string,
  targetUserId: string,
  user: UserContext
) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  // Caller must be an existing participant (or admin)
  await ensureConversationParticipant(conversationId, user.id, user.role);

  // Target user must exist
  const targetProfile = await prisma.profile.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!targetProfile) {
    throw new AppError(404, 'User to add does not exist.');
  }

  // Check duplicate
  const existing = await prisma.chatParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: targetUserId,
      },
    },
  });

  if (existing) {
    throw new AppError(409, 'User is already a participant in this conversation.');
  }

  return prisma.chatParticipant.create({
    data: {
      conversationId,
      userId: targetUserId,
      createdAt: new Date(),
    },
    select: PARTICIPANT_SELECT,
  });
}

/**
 * Removes a participant from an existing conversation.
 */
export async function removeParticipantFromConversation(
  conversationId: string,
  targetUserId: string,
  user: UserContext
) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  // A user can remove themselves (leave), or existing participant / admin can remove
  if (targetUserId !== user.id && user.role !== 'admin') {
    await ensureConversationParticipant(conversationId, user.id, user.role);
  }

  const participant = await prisma.chatParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: targetUserId,
      },
    },
  });

  if (!participant) {
    throw new AppError(404, 'Participant record not found in this conversation.');
  }

  return prisma.chatParticipant.delete({
    where: {
      conversationId_userId: {
        conversationId,
        userId: targetUserId,
      },
    },
    select: {
      id: true,
      conversationId: true,
      userId: true,
    },
  });
}

/**
 * Sends a message in a conversation.
 * Strictly binds senderId from authenticated user session.
 */
export async function sendMessage(
  conversationId: string,
  input: SendMessageInput,
  user: UserContext
) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new AppError(404, 'Conversation not found.');
  }

  // Caller MUST be a participant
  await ensureConversationParticipant(conversationId, user.id, user.role);

  const trimmedMessage = input.message.trim();
  if (!trimmedMessage) {
    throw new AppError(400, 'Message cannot be empty.');
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        message: trimmedMessage,
        createdAt: now,
      },
      select: MESSAGE_SELECT,
    });

    // Update conversation timestamp
    await tx.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: now },
    });

    // Update sender's last read timestamp
    await tx.chatParticipant.updateMany({
      where: {
        conversationId,
        userId: user.id,
      },
      data: {
        lastReadAt: now,
      },
    });

    return message;
  });
}

/**
 * Updates a previously sent message.
 * Only the message author can edit their message.
 */
export async function updateMessage(
  messageId: string,
  input: UpdateMessageInput,
  user: UserContext
) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, conversationId: true },
  });

  if (!message) {
    throw new AppError(404, 'Message not found.');
  }

  if (message.senderId !== user.id) {
    throw new AppError(403, 'You can only edit your own messages.');
  }

  const trimmed = input.message.trim();
  if (!trimmed) {
    throw new AppError(400, 'Message cannot be empty.');
  }

  return prisma.chatMessage.update({
    where: { id: messageId },
    data: { message: trimmed },
    select: MESSAGE_SELECT,
  });
}

/**
 * Deletes a message.
 * Allowed: The message author or an Administrator.
 */
export async function deleteMessage(messageId: string, user: UserContext) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, conversationId: true },
  });

  if (!message) {
    throw new AppError(404, 'Message not found.');
  }

  if (message.senderId !== user.id && user.role !== 'admin') {
    throw new AppError(403, 'You can only delete your own messages.');
  }

  return prisma.chatMessage.delete({
    where: { id: messageId },
    select: { id: true, conversationId: true },
  });
}

/**
 * Marks conversation as read for the authenticated participant.
 */
export async function markConversationAsRead(
  conversationId: string,
  user: UserContext
) {
  const participant = await prisma.chatParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  if (!participant) {
    throw new AppError(403, 'You are not a participant in this conversation.');
  }

  const now = new Date();

  return prisma.chatParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: {
      lastReadAt: now,
    },
    select: PARTICIPANT_SELECT,
  });
}
