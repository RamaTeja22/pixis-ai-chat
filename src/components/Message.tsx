import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, RotateCcw, Trash2, ThumbsUp, ThumbsDown, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Message as MessageType, Citation, Attachment } from '@/store/useChatStore';
import { cn } from '@/lib/utils';
import { highlight } from '@/lib/shiki';
import MessageActions from './MessageActions';
import FollowUpChips from './FollowUpChips';
import { Tooltip } from '@/components/ui/tooltip';

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
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [showRightRail, setShowRightRail] = useState(false);

  const displayCitations = message.citations;

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

  const handleCitationClick = useCallback((citation: Citation) => {
    setSelectedCitation(citation);
    setShowRightRail(true);
  }, []);

  const closeRightRail = useCallback(() => {
    setShowRightRail(false);
    setSelectedCitation(null);
  }, []);

  const renderContent = useCallback((content: string) => {
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const citationRegex = /\[(\d+)\]/g;
      const citations = Array.from(paragraph.matchAll(citationRegex));
      
      if (citations.length > 0) {
        let lastIndex = 0;
        const elements: React.ReactNode[] = [];
        
        citations.forEach((match, matchIndex) => {
          const citationId = parseInt(match[1]);
          const citation = message.citations?.find((c: Citation) => c.id === citationId);
          const matchStart = match.index!;
          
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
        
        return <div key={index} className="mb-4">{elements}</div>;
      }
      
      return (
        <div key={index} className="mb-4">
          <p>{paragraph}</p>
        </div>
      );
    });
  }, [message.citations, handleCitationClick]);

  const renderCodeBlock = useCallback(async (content: string): Promise<React.ReactNode[]> => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Check for incomplete code blocks (streaming)
    const hasIncompleteBlock = content.includes('```') && !content.match(/```[\s\S]*```/);

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;
      const language = match[1] || 'text';
      const code = match[2];

      if (matchStart > lastIndex) {
        const textBefore = content.slice(lastIndex, matchStart);
        if (textBefore.trim()) {
          parts.push(
            <div key={`text-${lastIndex}`} className="mb-4">
              {renderContent(textBefore)}
            </div>
          );
        }
      }

      try {
        const highlightedCode = await highlight(code, language);
        parts.push(
          <div key={`code-${matchStart}`} className="mb-4">
            <div className="bg-muted/50 rounded-lg overflow-hidden border">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <span className="text-sm font-mono text-muted-foreground">
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
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                </pre>
              </div>
            </div>
          </div>
        );
      } catch (error) {
        // Fallback to plain text if highlighting fails
        parts.push(
          <div key={`code-${matchStart}`} className="mb-4">
            <div className="bg-muted/50 rounded-lg overflow-hidden border">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <span className="text-sm font-mono text-muted-foreground">
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

    // Handle incomplete code blocks during streaming
    if (hasIncompleteBlock && isStreaming) {
      const lastCodeBlockStart = content.lastIndexOf('```');
      if (lastCodeBlockStart > lastIndex) {
        const textBefore = content.slice(lastIndex, lastCodeBlockStart);
        if (textBefore.trim()) {
          parts.push(
            <div key="text-before-incomplete" className="mb-4">
              {renderContent(textBefore)}
            </div>
          );
        }
        
        // Show incomplete code block indicator
        const incompleteCode = content.slice(lastCodeBlockStart);
        parts.push(
          <div key="incomplete-code" className="mb-4">
            <div className="bg-muted/50 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-dashed">
                <span className="text-sm font-mono text-muted-foreground">
                  {incompleteCode.split('\n')[0].replace('```', '').trim() || 'text'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Streaming...</span>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-muted-foreground">
                  <code>{incompleteCode}</code>
                </pre>
              </div>
            </div>
          </div>
        );
        return parts;
      }
    }

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
  }, [renderContent, isStreaming]);

  // useEffect hook moved here to ensure renderCodeBlock is defined before use
  useEffect(() => {
    if (message.content && message.content.includes('```')) {
      // Use renderCodeBlock to process both code blocks and inline citations
      renderCodeBlock(message.content).then(processedContent => {
        setHighlightedContent(processedContent);
      }).catch(error => {
        console.error('Error processing code blocks:', error);
        setHighlightedContent([]);
      });
    } else {
      setHighlightedContent([]);
    }
  }, [message.content, renderCodeBlock]);

  // Efficient streaming effect - only process when streaming ends
  useEffect(() => {
    if (!isStreaming && message.content && message.content.includes('```')) {
      // Process content when streaming ends to avoid page unresponsiveness
      renderCodeBlock(message.content).then(processedContent => {
        setHighlightedContent(processedContent);
      }).catch(error => {
        console.error('Error processing final content:', error);
        setHighlightedContent([]);
      });
    }
  }, [isStreaming, message.content, renderCodeBlock]);

  if (message.role === 'user') {
    return (
      <div className="flex items-start gap-4 mr-6">
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

  return (
    <div className="flex items-start gap-4 mr-6">
      
      <div className="flex-1 min-w-0">
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
          {displayCitations && displayCitations.length > 0 && (
            <button
              onClick={() => setActiveTab('sources')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'sources'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              Sources({displayCitations.length})
            </button>
          )}

        </div>

        {activeTab === 'answer' ? (
          <div>
            {displayCitations && displayCitations.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayCitations.slice(0, 6).map((citation: Citation) => (
                    <SourceCard
                      key={citation.id}
                      citation={citation}
                      onClick={() => handleCitationClick(citation)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="prose prose-sm max-w-none dark:prose-invert">
              {highlightedContent.length > 0 ? (
                highlightedContent
              ) : isStreaming && message.content.includes('```') ? (
                <div className="space-y-4">
                  {/* Show streaming indicator for code blocks */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Code blocks will be formatted when streaming completes...</span>
                  </div>
                  {/* Show raw content during streaming for code blocks */}
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                    <pre className="whitespace-pre-wrap">{message.content}</pre>
                  </div>
                </div>
              ) : (
                renderContent(message.content || 'No content available')
              )}
            </div>

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
          <div>
            {displayCitations && displayCitations.length > 0 ? (
              <div className="space-y-3">
                {displayCitations.map((citation: Citation) => (
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

      {showRightRail && selectedCitation && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={closeRightRail}
          />
          
          {/* Right Rail for Source Details */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-6 top-6 h-[calc(100vh-3rem)] w-96 bg-background border rounded-lg shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Source Details</h3>
                <button
                  onClick={closeRightRail}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Content */}
              <div className="space-y-4">
                {/* Source Header */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  {selectedCitation.favicon && (
                    <img
                      src={selectedCitation.favicon}
                      alt=""
                      className="w-8 h-8 rounded-sm flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-2 line-clamp-2">
                      {selectedCitation.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedCitation.domain}
                    </p>
                    <a
                      href={selectedCitation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Source
                    </a>
                  </div>
                </div>

                {/* Source Snippet */}
                {selectedCitation.snippet && (
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h5 className="font-medium text-sm mb-2 text-muted-foreground">Preview</h5>
                    <p className="text-sm leading-relaxed">{selectedCitation.snippet}</p>
                  </div>
                )}

                {/* Related Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(selectedCitation.url, '_blank')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Source
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCitation.url);
                      // You could add a toast notification here
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

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

const CitationChip: React.FC<{
  citation: Citation;
  onClick: () => void;
}> = ({ citation, onClick }) => {
  const tooltipContent = (
    <div className="max-w-xs p-3 space-y-2">
      <div className="flex items-start gap-2">
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
          <h4 className="font-medium text-sm line-clamp-2 mb-1">
            {citation.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {citation.domain}
          </p>
        </div>
      </div>
      {citation.snippet && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {citation.snippet}
        </p>
      )}
      <p className="text-xs text-primary font-medium">
        Click to view details
      </p>
  </div>
  );

  return (
    <Tooltip content={tooltipContent} side="top">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all duration-200 cursor-pointer border border-primary/20 hover:border-primary/30 shadow-sm"
      >
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
    </Tooltip>
  );
};

export default Message;