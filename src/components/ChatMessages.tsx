import React, { useRef, useEffect } from 'react';
import { Message as MessageType, Citation } from '@/store/useChatStore';
import { useChatStore } from '@/store/useChatStore';
import Message from './Message';

const ChatMessages: React.FC = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    currentConversation,
    addMessage,
    updateMessageContent,
    appendMessageContent,
    addCitations,
    addSuggestions,
    setMessageStreaming,
    startStreaming,
    stopStreaming,
    removeMessage,
    removeMessagePair,
    thumbsUpMessage,
    thumbsDownMessage,
    renameConversation,
  } = useChatStore();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);

  const handleCopy = (messageId: string) => {
    console.log('Copy message:', messageId);
  };

  const handleRegenerate = (messageId: string) => {
    if (!currentConversation) return;
    
    // Find the message to regenerate
    const message = currentConversation.messages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant') return;
    
    // Find the user message that prompted this response
    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;
    
    const userMessage = currentConversation.messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;
    
    // Remove the current assistant response
    removeMessage(currentConversation.id, messageId);
    
    // Regenerate the response
    handleStreamResponse(userMessage.content);
  };

  const handleDelete = (messageId: string) => {
    if (!currentConversation) return;
    removeMessagePair(currentConversation.id, messageId);
  };

  const handleFollowUp = (prompt: string) => {
    if (!currentConversation) return;
    
    addMessage(currentConversation.id, {
      role: 'user',
      content: prompt,
    });
    
    handleStreamResponse(prompt);
  };

  const handleCitationClick = (citation: Citation) => {
   
  };

  const handleThumbsUp = (messageId: string) => {
    if (!currentConversation) return;
    thumbsUpMessage(currentConversation.id, messageId);
  };

  const handleThumbsDown = (messageId: string) => {
    if (!currentConversation) return;
    thumbsDownMessage(currentConversation.id, messageId);
  };

  const handleStreamResponse = async (prompt: string) => {
    if (!currentConversation) return;

    const assistantMessageId = addMessage(currentConversation.id, {
      role: 'assistant',
      content: '',
    });

    setMessageStreaming(currentConversation.id, assistantMessageId, true);
    startStreaming();

    try {
      const { chatAPI } = await import('@/lib/api');

      await chatAPI.streamChat(
        {
          message: prompt,
          model: useChatStore.getState().model,
          conversationId: currentConversation.id,
        },
        (chunk) => {
          console.log('ChatMessages received chunk:', chunk);
          appendMessageContent(currentConversation.id, assistantMessageId, chunk);
        },
        (citations) => {
          addCitations(currentConversation.id, assistantMessageId, citations);
        },
        (suggestions) => {
          addSuggestions(currentConversation.id, assistantMessageId, suggestions);
        },
        (conversationId) => {
        },
        abortControllerRef.current?.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Streaming error:', error);
        updateMessageContent(currentConversation.id, assistantMessageId,
          'Sorry, I encountered an error. Please try again.');
      }
    } finally {
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
    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto pr-6">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
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
};

export default ChatMessages;