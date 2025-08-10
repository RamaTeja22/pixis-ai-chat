'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, StopCircle, Paperclip, X } from 'lucide-react';
import { useShortcuts } from '@/hooks/useShortcuts';
import { useChatStore, Attachment } from '@/store/useChatStore';

export function PromptForm() {
  const [prompt, setPrompt] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { 
    currentConversation, 
    createConversation, 
    renameConversation,
    addMessage, 
    updateMessageContent, 
    appendMessageContent,
    setMessageStreaming,
    addCitations,
    addSuggestions,
    startStreaming,
    stopStreaming,
    streaming 
  } = useChatStore();
  
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleFocus = () => {
    textareaRef.current?.focus();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment: Attachment = {
            id: Math.random().toString(36).substring(2, 15),
            type: 'image',
            name: file.name,
            url: e.target?.result as string,
            size: file.size,
            mimeType: file.type,
          };
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if ((!prompt.trim() && attachments.length === 0) || streaming) return;

    const userPrompt = prompt.trim();
    setPrompt('');

    let conversationId = currentConversation?.id;
    if (!conversationId) {
      conversationId = createConversation(userPrompt || 'Image upload');
    } else if (currentConversation?.title === 'New Chat' && currentConversation?.messages.length === 0) {
      renameConversation(conversationId, userPrompt || 'Image upload');
    }

    addMessage(conversationId, {
      role: 'user',
      content: userPrompt || (attachments.length > 0 ? `Uploaded ${attachments.length} image${attachments.length > 1 ? 's' : ''}` : ''),
      attachments: attachments,
    });

    setAttachments([]);

    await handleStreamResponse(userPrompt || 'Please analyze the uploaded image(s)', conversationId);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleStreamResponse = async (prompt: string, conversationId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const assistantMessageId = addMessage(conversationId, {
      role: 'assistant',
      content: '',
    });

    setMessageStreaming(conversationId, assistantMessageId, true);
    startStreaming();

    try {
      const { chatAPI } = await import('@/lib/api');
      
      await chatAPI.streamChat(
        {
          message: prompt,
          model: currentConversation?.model || 'Balanced',
          conversationId,
        },
        (chunk) => {
          console.log('Received chunk:', chunk);
          appendMessageContent(conversationId, assistantMessageId, chunk);
        },
        (citations) => {
          addCitations(conversationId, assistantMessageId, citations);
        },
        (suggestions) => {
          addSuggestions(conversationId, assistantMessageId, suggestions);
        },
        (conversationId) => {
          console.log('Stream completed for conversation:', conversationId);
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Streaming error:', error);
        updateMessageContent(conversationId, assistantMessageId, 
          'Sorry, I encountered an error. Please try again.');
      }
    } finally {
      setMessageStreaming(conversationId, assistantMessageId, false);
      stopStreaming();
      abortControllerRef.current = null;
    }
  };

  useShortcuts({
    onFocusInput: handleFocus,
    onSubmit: () => handleSubmit(),
  });

  React.useEffect(() => {
    handleFocus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative group">
              {attachment.type === 'image' && (
                <div className="relative">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-16 w-16 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-center gap-3"
      >
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-12 w-12 flex-shrink-0 border-2 border-input/50 hover:border-input"
          onClick={() => fileInputRef.current?.click()}
          disabled={streaming}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... or upload an image"
            className="min-h-[64px] w-full resize-none rounded-2xl border-2 border-input/50 bg-background p-5 pr-20 shadow-lg hover:border-input focus:border-primary transition-colors text-lg"
            rows={1}
            disabled={streaming}
          />
          <Button
            type={streaming ? "button" : "submit"}
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary hover:bg-primary/90 shadow-lg"
            disabled={!streaming && (!prompt.trim() && attachments.length === 0)}
            onClick={streaming ? handleStopStreaming : undefined}
            aria-label={streaming ? "Stop generating" : "Send message"}
          >
            {streaming ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}