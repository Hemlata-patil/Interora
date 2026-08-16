import React, { useState } from 'react';
import { Button } from '@/components';
import { Send, Loader2 } from 'lucide-react';

export interface MessageComposerProps {
  onSendMessage: (text: string) => Promise<void>;
  draftMessage: string;
  onDraftChange: (text: string) => void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  draftMessage,
  onDraftChange,
  disabled = false,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = draftMessage.trim();
    if (!text || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(text);
      onDraftChange('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
      <textarea
        rows={1}
        value={draftMessage}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message to your mentor... (Press Enter to send)"
        disabled={disabled || isSending}
        className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-24"
      />
      <Button variant="primary" size="md" type="submit" disabled={disabled || isSending || !draftMessage.trim()}>
        {isSending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4 mr-1.5" /> Send
          </>
        )}
      </Button>
    </form>
  );
};