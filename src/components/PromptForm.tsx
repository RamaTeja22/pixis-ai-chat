'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, StopCircle } from 'lucide-react';
import { useShortcuts } from '@/hooks/useShortcuts';
import { useChatStore } from '@/store/useChatStore';

export function PromptForm() {
  const [prompt, setPrompt] = React.useState('');
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

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!prompt.trim() || streaming) return;

    const userPrompt = prompt.trim();
    setPrompt('');

    // Create conversation if none exists
    let conversationId = currentConversation?.id;
    if (!conversationId) {
      conversationId = createConversation(userPrompt);
    } else if (currentConversation?.title === 'New Chat' && currentConversation?.messages.length === 0) {
      // Update the title if it's still "New Chat" and no messages yet
      renameConversation(conversationId, userPrompt);
    }

    // Add user message
    addMessage(conversationId, {
      role: 'user',
      content: userPrompt,
    });

    // Start streaming response
    await handleStreamResponse(userPrompt, conversationId);
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Stream response from API
  const handleStreamResponse = async (prompt: string, conversationId: string) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Add assistant message placeholder and get its ID
    const assistantMessageId = addMessage(conversationId, {
      role: 'assistant',
      content: '',
    });

    // Set streaming state
    setMessageStreaming(conversationId, assistantMessageId, true);
    startStreaming();

    try {
      // Import the API dynamically to avoid SSR issues
      const { chatAPI } = await import('@/lib/api');
      
      await chatAPI.streamChat(
        {
          message: prompt,
          model: currentConversation?.model || 'Balanced',
          conversationId,
        },
        (chunk) => {
          // Append chunk to the message
          console.log('Received chunk:', chunk);
          appendMessageContent(conversationId, assistantMessageId, chunk);
        },
        (citations) => {
          // Add citations to the message
          addCitations(conversationId, assistantMessageId, citations);
        },
        (suggestions) => {
          // Add suggestions to the message
          addSuggestions(conversationId, assistantMessageId, suggestions);
        },
        (conversationId) => {
          // Handle completion
          console.log('Stream completed for conversation:', conversationId);
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Streaming error:', error);
        // Add error message
        updateMessageContent(conversationId, assistantMessageId, 
          'Sorry, I encountered an error. Please try again.');
      }
    } finally {
      // Clean up
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
    // Instant focus on mount
    handleFocus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full items-center"
    >
      <Textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        className="min-h-[60px] w-full resize-none rounded-xl border border-input bg-background p-4 pr-20 shadow-sm"
        rows={1}
        disabled={streaming}
      />
      <Button
        type={streaming ? "button" : "submit"}
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2"
        disabled={!prompt.trim() && !streaming}
        onClick={streaming ? handleStopStreaming : undefined}
        aria-label={streaming ? "Stop generating" : "Send message"}
      >
        {streaming ? (
          <StopCircle className="h-5 w-5" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}