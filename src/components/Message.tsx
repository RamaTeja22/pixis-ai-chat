'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Trash2, 
  ChevronRight,
  Check
} from 'lucide-react';
import { Message as MessageType, Citation } from '@/store/useChatStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';

interface MessageProps {
  message: MessageType;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onDelete?: (messageId: string) => void;
  onThumbsUp?: (messageId: string) => void;
  onThumbsDown?: (messageId: string) => void;
  onFollowUp?: (suggestion: string) => void;
  onCitationClick?: (citation: Citation) => void;
  isStreaming?: boolean;
}

const CodeBlock = ({ code, language = 'text' }: { code: string; language?: string }) => {
  const [copied, setCopied] = React.useState(false);
  const [highlightedCode, setHighlightedCode] = React.useState<string>('');
  const [isHighlighting, setIsHighlighting] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    const highlightCode = async () => {
      if (code && language !== 'text') {
        setIsHighlighting(true);
        try {
          const { highlight } = await import('@/lib/shiki');
          const highlighted = await highlight(code, language);
          setHighlightedCode(highlighted);
        } catch (error) {
          console.error('Failed to highlight code:', error);
          setHighlightedCode('');
        } finally {
          setIsHighlighting(false);
        }
      }
    };

    highlightCode();
  }, [code, language]);

  return (
    <div className="relative my-4 rounded-lg bg-muted/50 border">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <span className="text-sm font-mono text-muted-foreground uppercase">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        {isHighlighting ? (
          <pre className="text-sm font-mono">
            <code>{code}</code>
          </pre>
        ) : highlightedCode ? (
          <div 
            dangerouslySetInnerHTML={{ __html: highlightedCode }} 
            className="syntax-highlighted-container"
          />
        ) : (
          <pre className="text-sm font-mono">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};


const CitationChip = ({ 
  citation, 
  onClick 
}: { 
  citation: Citation; 
  onClick: () => void;
}) => {
  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-medium text-sm">{citation.title}</p>
      <p className="text-xs text-muted-foreground break-all">{citation.url}</p>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} side="top" className="max-w-xs">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
      >
        <span className="font-medium">[{citation.id}]</span>
        {citation.favicon && (
          <img 
            src={citation.favicon} 
            alt="" 
            className="w-3 h-3 rounded-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span className="truncate max-w-32">{citation.domain}</span>
      </motion.button>
    </Tooltip>
  );
};

const FollowUpChip = ({ 
  suggestion, 
  onClick 
}: { 
  suggestion: string; 
  onClick: () => void;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors cursor-pointer border"
    >
      <span className="truncate">{suggestion}</span>
      <ChevronRight className="h-4 w-4 opacity-50" />
    </motion.button>
  );
};

const MessageActions = ({
  onCopy,
  onRegenerate,
  onDelete,
  onThumbsUp,
  onThumbsDown,
  isStreaming,
  messageId,
  message,
}: {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onDelete?: (messageId: string) => void;
  onThumbsUp?: (messageId: string) => void;
  onThumbsDown?: (messageId: string) => void;
  isStreaming?: boolean;
  messageId: string;
  message: MessageType;
}) => {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {onCopy && (
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0">
          <Copy className="h-4 w-4" />
        </Button>
      )}
      {onRegenerate && !isStreaming && (
        <Button variant="ghost" size="sm" onClick={onRegenerate} className="h-8 w-8 p-0">
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      {onThumbsUp && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onThumbsUp(messageId)} 
          className={cn(
            "h-8 w-8 p-0",
            message.thumbsUp && "text-green-600 bg-green-50 dark:bg-green-950"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
      )}
      {onThumbsDown && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onThumbsDown(messageId)} 
          className={cn(
            "h-8 w-8 p-0",
            message.thumbsDown && "text-red-600 bg-red-50 dark:bg-red-950"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={() => onDelete(messageId)} className="h-8 w-8 p-0 text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export function Message({
  message,
  onCopy,
  onRegenerate,
  onDelete,
  onThumbsUp,
  onThumbsDown,
  onFollowUp,
  onCitationClick,
  isStreaming = false,
}: MessageProps) {
  const isUser = message.role === 'user';
  const hasCitations = message.citations && message.citations.length > 0;
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;

  const parseContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts;
  };

  const contentParts = parseContent(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    onCopy?.();
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "group relative p-4",
          isUser ? "bg-background" : "bg-muted/30"
        )}
      >
      <div className={cn(
        "mx-auto max-w-4xl",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "inline-block rounded-lg p-4 max-w-full",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-background border shadow-sm"
        )}>
          {isUser ? (
            <div className="space-y-3">
              {message.content && (
                <p className="text-sm">{message.content}</p>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="relative">
                      {attachment.type === 'image' && (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-full h-auto max-h-48 rounded-md border object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {contentParts.map((part, index) => (
                <React.Fragment key={index}>
                  {part.type === 'text' && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {part.content.split(' ').map((word, wordIndex) => {
                        const citationMatch = word.match(/\[(\d+)\]/);
                        if (citationMatch && hasCitations) {
                          const citationId = parseInt(citationMatch[1]);
                          const citation = message.citations?.find(c => c.id === citationId);
                          if (citation) {
                            return (
                              <React.Fragment key={wordIndex}>
                                <span>{word.replace(/\[\d+\]/, '')}</span>
                                <CitationChip 
                                  citation={citation} 
                                  onClick={() => onCitationClick?.(citation)}
                                />
                                {' '}
                              </React.Fragment>
                            );
                          }
                        }
                        return <span key={wordIndex}>{word} </span>;
                      })}
                    </div>
                  )}
                  {part.type === 'code' && (
                    <CodeBlock code={part.content} language={part.language} />
                  )}
                </React.Fragment>
              ))}

              {isStreaming && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              )}

              {hasSuggestions && !isStreaming && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Follow up with:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions?.map((suggestion, index) => (
                      <FollowUpChip
                        key={index}
                        suggestion={suggestion}
                        onClick={() => onFollowUp?.(suggestion)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isUser && (
          <div className="mt-2 flex justify-end">
            <MessageActions
              onCopy={handleCopy}
              onRegenerate={onRegenerate}
              onDelete={onDelete}
              onThumbsUp={onThumbsUp}
              onThumbsDown={onThumbsDown}
              isStreaming={isStreaming}
              messageId={message.id}
              message={message}
            />
          </div>
        )}
      </div>
      </motion.div>
    </TooltipProvider>
  );
}