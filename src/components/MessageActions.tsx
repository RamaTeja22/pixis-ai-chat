import React from 'react';
import { Copy, RotateCcw, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message as MessageType } from '@/store/useChatStore';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  message: MessageType;
  onCopy: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  copied: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onCopy,
  onRegenerate,
  onDelete,
  onThumbsUp,
  onThumbsDown,
  copied,
}) => {
  return (
    <div className="flex items-center gap-1">
      {/* Copy button */}
      <button
        onClick={onCopy}
        className={cn(
          'p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors',
          copied && 'text-green-600'
        )}
        title="Copy message"
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Regenerate button - only for assistant messages */}
      {message.role === 'assistant' && (
        <button
          onClick={onRegenerate}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          title="Regenerate response"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
        title="Delete message"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Thumbs up/down - only for assistant messages */}
      {message.role === 'assistant' && (
        <>
          <button
            onClick={onThumbsUp}
            className={cn(
              'p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-md transition-colors',
              message.thumbsUp && 'text-green-600'
            )}
            title="Thumbs up"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={onThumbsDown}
            className={cn(
              'p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors',
              message.thumbsDown && 'text-red-600'
            )}
            title="Thumbs down"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default MessageActions;
