import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, RotateCcw, Trash2, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { Message as MessageType, Citation, Attachment } from '@/store/useChatStore';
import { cn } from '@/lib/utils';
import { highlight } from '@/lib/shiki';
import MessageActions from './MessageActions';
import FollowUpChips from './FollowUpChips';

interface MessageProps {
  message: MessageType;
  onCopy: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onThumbsUp: (messageId: string) => void;
  onThumbsDown: (messageId: string) => void;
  onFollowUp: (prompt: string) => void;
  onCitationClick: (citation: Citation) => void;
  isStreaming?: boolean;
}

const Message: React.FC<MessageProps> = ({
  message,
  onCopy,
  onRegenerate,
  onDelete,
  onThumbsUp,
  onThumbsDown,
  onFollowUp,
  onCitationClick,
  isStreaming = false,
}) => {
  const [activeTab, setActiveTab] = useState<'answer' | 'sources'>('answer');
  const [copied, setCopied] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState<React.ReactNode[]>([]);

  // Process content highlighting when message content changes
  useEffect(() => {
    const processContent = async () => {
      const processed = await renderCodeBlock(message.content);
      setHighlightedContent(processed);
    };
    processContent();
  }, [message.content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(message.id);
  };

  const handleRegenerate = () => {
    onRegenerate(message.id);
  };

  const handleDelete = () => {
    onDelete(message.id);
  };

  const handleThumbsUp = () => {
    onThumbsUp(message.id);
  };

  const handleThumbsDown = () => {
    onThumbsDown(message.id);
  };

  const handleFollowUp = (prompt: string) => {
    onFollowUp(prompt);
  };

  const handleCitationClick = (citation: Citation) => {
    // Open citation URL in new tab (Perplexity style)
    window.open(citation.url, '_blank');
  };

  const renderContent = (content: string) => {
    // Split content into paragraphs and process each
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph contains citations
      const citationRegex = /\[(\d+)\]/g;
      const citations = Array.from(paragraph.matchAll(citationRegex));
      
      if (citations.length > 0) {
        // Process paragraph with citations
        let lastIndex = 0;
        const elements: React.ReactNode[] = [];
        
        citations.forEach((match, matchIndex) => {
          const citationId = parseInt(match[1]);
          const citation = message.citations?.find((c: Citation) => c.id === citationId);
          const matchStart = match.index!;
          
          // Add text before citation
          if (matchStart > lastIndex) {
            const textBefore = paragraph.slice(lastIndex, matchStart);
            if (textBefore.trim()) {
              elements.push(
                <span key={`text-${index}-${matchIndex}`}>
                  {textBefore}
                </span>
              );
            }
          }
          
          // Add citation chip
          if (citation) {
            elements.push(
              <CitationChip
                key={`citation-${index}-${matchIndex}`}
                citation={citation}
                onClick={() => handleCitationClick(citation)}
              />
            );
          }
          
          lastIndex = matchStart + match[0].length;
        });
        
        // Add remaining text after last citation
        if (lastIndex < paragraph.length) {
          const remainingText = paragraph.slice(lastIndex);
          if (remainingText.trim()) {
            elements.push(
              <span key={`text-${index}-end`}>
                {remainingText}
              </span>
            );
          }
        }
        
        return (
          <p key={index} className="mb-4">
            {elements}
          </p>
        );
      } else {
        // Simple paragraph without citations
        return (
          <p key={index} className="mb-4">
            {paragraph}
          </p>
        );
      }
    });
  };

  const renderCodeBlock = async (content: string): Promise<React.ReactNode[]> => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2];
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;

      // Add text before code block with citation processing
      if (matchStart > lastIndex) {
        const textBefore = content.slice(lastIndex, matchStart);
        if (textBefore.trim()) {
          parts.push(
            <div key={`text-${matchStart}`} className="mb-4">
              {renderContent(textBefore)}
            </div>
          );
        }
      }

      // Add code block with proper async highlighting
      try {
        const highlightedCode = await highlight(code, language);
        parts.push(
          <div key={`code-${matchStart}`} className="mb-4">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                <span className="text-sm font-mono text-muted-foreground capitalize">
                  {language}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: highlightedCode,
                  }}
                />
              </div>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Error highlighting code:', error);
        // Fallback to plain code if highlighting fails
        parts.push(
          <div key={`code-${matchStart}`} className="mb-4">
            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                <span className="text-sm font-mono text-muted-foreground capitalize">
                  {language}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          </div>
        );
      }

      lastIndex = matchEnd;
    }

    // Add remaining text after last code block with citation processing
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push(
          <div key="text-end" className="mb-4">
            {renderContent(remainingText)}
          </div>
        );
      }
    }

    return parts.length > 0 ? parts : renderContent(content);
  };

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment: Attachment, index: number) => (
                <div key={index} className="relative">
                  {attachment.type.startsWith('image/') ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg border flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant message with Perplexity-style layout
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        {/* Tabs - only show Sources tab when citations are available */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('answer')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'answer'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Answer
          </button>
          {message.citations && message.citations.length > 0 && (
            <button
              onClick={() => setActiveTab('sources')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'sources'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Sources({message.citations.length})
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'answer' ? (
          <div>
            {/* Source Cards at the top - only show when citations are available */}
            {message.citations && message.citations.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {message.citations.slice(0, 6).map((citation: Citation) => (
                    <SourceCard
                      key={citation.id}
                      citation={citation}
                      onClick={() => handleCitationClick(citation)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Answer Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {highlightedContent}
            </div>

            {/* Follow-up chips */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-6">
                <FollowUpChips
                  suggestions={message.suggestions}
                  onFollowUp={handleFollowUp}
                />
              </div>
            )}
          </div>
        ) : (
          /* Sources Tab */
          <div>
            {message.citations && message.citations.length > 0 ? (
              <div className="space-y-3">
                {message.citations.map((citation: Citation) => (
                  <SourceCard
                    key={citation.id}
                    citation={citation}
                    onClick={() => handleCitationClick(citation)}
                    expanded
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No sources available for this response.</p>
            )}
          </div>
        )}

        {/* Message Actions */}
        <div className="mt-4 flex items-center gap-2">
          <MessageActions
            message={message}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onDelete={handleDelete}
            onThumbsUp={handleThumbsUp}
            onThumbsDown={handleThumbsDown}
            copied={copied}
          />
        </div>
      </div>
    </div>
  );
};

// Source Card Component
const SourceCard: React.FC<{
  citation: Citation;
  onClick: () => void;
  expanded?: boolean;
}> = ({ citation, onClick, expanded = false }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        expanded ? 'mb-2' : ''
      )}
    >
      <div className="flex items-start gap-3">
        {citation.favicon && (
          <img
            src={citation.favicon}
            alt=""
            className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-sm line-clamp-2 mb-1">
            {citation.title}
          </h5>
          <p className="text-xs text-muted-foreground truncate">
            {citation.domain}
          </p>
          {expanded && citation.snippet && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {citation.snippet}
            </p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
  </div>
    </motion.button>
  );
};

// Citation Chip Component (simplified - no tooltip needed)
const CitationChip: React.FC<{
  citation: Citation;
  onClick: () => void;
}> = ({ citation, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer border border-primary/20 hover:border-primary/30 shadow-sm"
    >
      <span className="font-semibold">[{citation.id}]</span>
      {citation.favicon && (
        <img
          src={citation.favicon}
          alt=""
          className="w-4 h-4 rounded-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <span className="truncate max-w-36 font-medium">{citation.domain}</span>
    </motion.button>
  );
};

export default Message;