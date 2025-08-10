'use client';

import { useChatStore } from '@/store/useChatStore';
import { Message } from '@/components/Message';
import { Citation } from '@/store/useChatStore';
import * as React from 'react';

export function ChatMessages() {
    const {
    currentConversation, 
    addMessage, 
    updateMessageContent, 
    appendMessageContent,
    setMessageStreaming,
    addCitations,
    addSuggestions,
    removeMessagePair,
    thumbsUpMessage,
    thumbsDownMessage,
    startStreaming,
    stopStreaming
  } = useChatStore();
  
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);

  // Handle follow-up suggestion click
  const handleFollowUp = (suggestion: string) => {
    if (!currentConversation) return;
    
    // Add user message with the suggestion
    addMessage(currentConversation.id, {
      role: 'user',
      content: suggestion,
    });

    // Start streaming response
    handleStreamResponse(suggestion);
  };

  // Handle citation click
  const handleCitationClick = (citation: Citation) => {
    // Open citation in new tab
    window.open(citation.url, '_blank');
  };

  // Handle message actions
  const handleCopy = () => {
    // Copy functionality is handled in the Message component
  };

  const handleRegenerate = () => {
    if (!currentConversation) return;
    
    // Remove the last assistant message and regenerate
    const lastAssistantMessage = currentConversation.messages
      .filter(m => m.role === 'assistant')
      .pop();
    
    if (lastAssistantMessage) {
      // Find the user message that preceded it
      const userMessageIndex = currentConversation.messages.findIndex(m => m.id === lastAssistantMessage.id) - 1;
      const userMessage = currentConversation.messages[userMessageIndex];
      
      if (userMessage && userMessage.role === 'user') {
        // Remove the assistant message and regenerate
        // This would require a removeMessage function in the store
        handleStreamResponse(userMessage.content);
      }
    }
  };

  const handleDelete = (messageId: string) => {
    if (!currentConversation) return;
    removeMessagePair(currentConversation.id, messageId);
  };

  const handleThumbsUp = (messageId: string) => {
    if (!currentConversation) return;
    thumbsUpMessage(currentConversation.id, messageId);
  };

  const handleThumbsDown = (messageId: string) => {
    if (!currentConversation) return;
    thumbsDownMessage(currentConversation.id, messageId);
  };

  // Stream response from API (for follow-up suggestions)
  const handleStreamResponse = async (prompt: string) => {
    if (!currentConversation) return;

    // Add assistant message placeholder and get its ID
    const assistantMessageId = addMessage(currentConversation.id, {
      role: 'assistant',
      content: '',
    });

    // Set streaming state
    setMessageStreaming(currentConversation.id, assistantMessageId, true);
    startStreaming();

    try {
      // Import the API dynamically to avoid SSR issues
      const { chatAPI } = await import('@/lib/api');
      
      await chatAPI.streamChat(
        {
          message: prompt,
          model: currentConversation.model,
          conversationId: currentConversation.id,
        },
        (chunk) => {
          // Append chunk to the message
          console.log('ChatMessages received chunk:', chunk);
          appendMessageContent(currentConversation.id, assistantMessageId, chunk);
        },
        (citations) => {
          // Add citations to the message
          addCitations(currentConversation.id, assistantMessageId, citations);
        },
        (suggestions) => {
          // Add suggestions to the message
          addSuggestions(currentConversation.id, assistantMessageId, suggestions);
        },
        (conversationId) => {
          // Handle completion
          console.log('Stream completed for conversation:', conversationId);
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Streaming error:', error);
        // Add error message
        updateMessageContent(currentConversation.id, assistantMessageId, 
          'Sorry, I encountered an error. Please try again.');
      }
    } finally {
      // Clean up
      setMessageStreaming(currentConversation.id, assistantMessageId, false);
      stopStreaming();
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
      <div className="space-y-4">
        {currentConversation.messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onCopy={handleCopy}
            onRegenerate={handleRegenerate}
            onDelete={handleDelete}
            onThumbsUp={handleThumbsUp}
            onThumbsDown={handleThumbsDown}
            onFollowUp={handleFollowUp}
            onCitationClick={handleCitationClick}
            isStreaming={message.isStreaming}
          />
        ))}
      </div>
    </div>
  );
}