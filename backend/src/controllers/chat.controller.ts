import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as chatService from '../services/chat.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiSuccess, ApiError } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Parameter & Error Validation Helpers
// ─────────────────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractParam(req: Request, paramName: string): string {
  const raw = req.params[paramName];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !UUID_REGEX.test(value)) {
    throw new AppError(400, `Invalid ${paramName} format. Expected a valid UUID.`);
  }
  return value;
}

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.') || '_';
    if (!errors[field]) errors[field] = [];
    errors[field].push(issue.message);
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createConversationSchema = z.object({
  participantIds: z
    .array(z.string().uuid('Each participantId must be a valid UUID.'))
    .min(1, 'At least one other participant is required.'),
  initialMessage: z.string().trim().max(5000, 'Message cannot exceed 5000 characters.').optional(),
});

const addParticipantSchema = z.object({
  userId: z
    .string({ required_error: 'userId is required' })
    .uuid('Invalid userId format. Expected a valid UUID.'),
});

const sendMessageSchema = z.object({
  message: z
    .string({ required_error: 'message is required' })
    .trim()
    .min(1, 'message cannot be empty')
    .max(5000, 'message cannot exceed 5000 characters'),
});

const updateMessageSchema = z.object({
  message: z
    .string({ required_error: 'message is required' })
    .trim()
    .min(1, 'message cannot be empty')
    .max(5000, 'message cannot exceed 5000 characters'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/chat/conversations — List conversations where caller is a participant.
 */
export async function listConversationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const conversations = await chatService.listUserConversations({
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof conversations> = {
      success: true,
      data: conversations,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations/:id — Get conversation by ID with messages.
 */
export async function getConversationByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const conversation = await chatService.getConversationById(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof conversation> = {
      success: true,
      data: conversation,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations/:id/messages — Get message history for a conversation.
 */
export async function getConversationMessagesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = extractParam(req, 'id');
    const messages = await chatService.getConversationMessages(id, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof messages> = {
      success: true,
      data: messages,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations — Create a new conversation.
 */
export async function createConversationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const conversation = await chatService.createConversation(parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof conversation> = {
      success: true,
      message: 'Conversation initialized successfully.',
      data: conversation,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/participants — Add a participant.
 */
export async function addParticipantController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const conversationId = extractParam(req, 'id');
    const parsed = addParticipantSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const participant = await chatService.addParticipantToConversation(
      conversationId,
      parsed.data.userId,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof participant> = {
      success: true,
      message: 'Participant added successfully.',
      data: participant,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chat/conversations/:id/participants/:userId — Remove participant or leave.
 */
export async function removeParticipantController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const conversationId = extractParam(req, 'id');
    const targetUserId = extractParam(req, 'userId');

    const result = await chatService.removeParticipantFromConversation(
      conversationId,
      targetUserId,
      {
        id: req.user.id,
        role: req.user.role,
      }
    );

    const body: ApiSuccess<typeof result> = {
      success: true,
      message: 'Participant removed successfully.',
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/messages — Send a message in conversation.
 */
export async function sendMessageController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const conversationId = extractParam(req, 'id');
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const message = await chatService.sendMessage(conversationId, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof message> = {
      success: true,
      message: 'Message sent successfully.',
      data: message,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/chat/messages/:messageId — Edit a message.
 */
export async function updateMessageController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const messageId = extractParam(req, 'messageId');
    const parsed = updateMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      const body: ApiError = {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsed.error),
      };
      res.status(400).json(body);
      return;
    }

    const updated = await chatService.updateMessage(messageId, parsed.data, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof updated> = {
      success: true,
      message: 'Message updated successfully.',
      data: updated,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chat/messages/:messageId — Delete a message.
 */
export async function deleteMessageController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const messageId = extractParam(req, 'messageId');
    const deleted = await chatService.deleteMessage(messageId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof deleted> = {
      success: true,
      message: 'Message deleted successfully.',
      data: deleted,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/read — Mark conversation messages as read.
 */
export async function markConversationAsReadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required.');
    }

    const conversationId = extractParam(req, 'id');
    const participant = await chatService.markConversationAsRead(conversationId, {
      id: req.user.id,
      role: req.user.role,
    });

    const body: ApiSuccess<typeof participant> = {
      success: true,
      message: 'Conversation marked as read.',
      data: participant,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
