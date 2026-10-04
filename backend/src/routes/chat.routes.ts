import { Router } from 'express';
import {
  listConversationsController,
  getConversationByIdController,
  getConversationMessagesController,
  createConversationController,
  addParticipantController,
  removeParticipantController,
  sendMessageController,
  updateMessageController,
  deleteMessageController,
  markConversationAsReadController,
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Chat Routes — mounted at /api/chat
// ─────────────────────────────────────────────────────────────────────────────

const chatRouter = Router();

// Conversation management
chatRouter.get('/', authenticate, listConversationsController);
chatRouter.get('/conversations', authenticate, listConversationsController);

// Messaging within a conversation (sub-paths mounted before /:id)
chatRouter.get('/conversations/:id/messages', authenticate, getConversationMessagesController);
chatRouter.get('/:id/messages', authenticate, getConversationMessagesController);
chatRouter.post('/conversations/:id/messages', authenticate, sendMessageController);
chatRouter.post('/:id/messages', authenticate, sendMessageController);

chatRouter.post('/conversations/:id/read', authenticate, markConversationAsReadController);
chatRouter.post('/:id/read', authenticate, markConversationAsReadController);

// Participant management
chatRouter.post('/conversations/:id/participants', authenticate, addParticipantController);
chatRouter.post('/:id/participants', authenticate, addParticipantController);

chatRouter.delete('/conversations/:id/participants/:userId', authenticate, removeParticipantController);
chatRouter.delete('/:id/participants/:userId', authenticate, removeParticipantController);

chatRouter.get('/:id', authenticate, getConversationByIdController);
chatRouter.get('/conversations/:id', authenticate, getConversationByIdController);

chatRouter.post('/', authenticate, createConversationController);
chatRouter.post('/conversations', authenticate, createConversationController);

// Direct message manipulation (edit/delete)
chatRouter.patch('/messages/:messageId', authenticate, updateMessageController);
chatRouter.delete('/messages/:messageId', authenticate, deleteMessageController);

export default chatRouter;
