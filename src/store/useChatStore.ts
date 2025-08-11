import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Citation = {
  id: number;
  title: string;
  url: string;
  domain: string;
  favicon?: string;
  snippet?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  suggestions?: string[];
  timestamp: number;
  isStreaming?: boolean;
  thumbsUp?: boolean;
  thumbsDown?: boolean;
  attachments?: Attachment[];
};

export type Attachment = {
  id: string;
  type: 'image' | 'file';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
};

export type Folder = {
  id: string;
  name: string;
  conversationIds: string[];
  createdAt: number;
};

type ChatStore = {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;

  streaming: boolean;
  model: string;
  showFollowUps: boolean;
  messageWidth: 'compact' | 'comfortable' | 'wide';
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setCurrentConversation: (id: string) => void;
  
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessageContent: (conversationId: string, messageId: string, content: string) => void;
  appendMessageContent: (conversationId: string, messageId: string, contentChunk: string) => void;
  setMessageStreaming: (conversationId: string, messageId: string, streaming: boolean) => void;
  addCitations: (conversationId: string, messageId: string, citations: Citation[]) => void;
  addSuggestions: (conversationId: string, messageId: string, suggestions: string[]) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  removeMessagePair: (conversationId: string, messageId: string) => void;
  thumbsUpMessage: (conversationId: string, messageId: string) => void;
  thumbsDownMessage: (conversationId: string, messageId: string) => void;
  addAttachmentToMessage: (conversationId: string, messageId: string, attachment: Attachment) => void;
  regenerateLastResponse: (conversationId: string) => Promise<void>;
  
  startStreaming: () => void;
  stopStreaming: () => void;
  
  setModel: (model: string) => void;
  setShowFollowUps: (show: boolean) => void;
  setMessageWidth: (width: 'compact' | 'comfortable' | 'wide') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  
  folders: Folder[];
  createFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  moveConversationToFolder: (conversationId: string, folderId: string) => void;
  removeConversationFromFolder: (conversationId: string) => void;
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      currentConversation: null,
      streaming: false,
      model: 'Balanced',
      showFollowUps: true,
      messageWidth: 'comfortable',
      theme: 'system',
      sidebarOpen: true,
      folders: [],



      createConversation: (title = 'New Chat') => {
        const id = generateId();
        const currentModel = get().model; // Get the current model at creation time
        const conversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: currentModel,
        };
        
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
          currentConversation: conversation,
        }));
        
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter(c => c.id !== id);
          const newCurrentId = state.currentConversationId === id 
            ? (newConversations[0]?.id || null)
            : state.currentConversationId;
          
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
            currentConversation: newConversations.find(c => c.id === newCurrentId) || null,
          };
        });
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
          currentConversation: state.currentConversation?.id === id
            ? { ...state.currentConversation, title, updatedAt: Date.now() }
            : state.currentConversation,
        }));
      },

      setCurrentConversation: (id) => {
        const conversation = get().conversations.find(c => c.id === id);
        set({
          currentConversationId: id,
          currentConversation: conversation || null,
        });
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: Date.now(),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, newMessage],
                updatedAt: Date.now(),
              }
            : state.currentConversation,
        }));

        return newMessage.id;
      },

      updateMessageContent: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, content } : m
                ),
              }
            : state.currentConversation,
        }));
      },

      appendMessageContent: (conversationId, messageId, contentChunk) => {
        set((state) => {
          const updatedConversations = state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content: m.content + contentChunk } : m
                  ),
                }
              : c
          );
          
          const updatedCurrentConversation = state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, content: m.content + contentChunk } : m
                ),
              }
            : state.currentConversation;
          
          return {
            conversations: updatedConversations,
            currentConversation: updatedCurrentConversation,
          };
        });
      },

      setMessageStreaming: (conversationId, messageId, streaming) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, isStreaming: streaming } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, isStreaming: streaming } : m
                ),
              }
            : state.currentConversation,
        }));
      },

      addCitations: (conversationId, messageId, citations) => {
        set((state) => {
          const updatedConversations = state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, citations } : m
                  ),
                }
              : c
          );
          
          const updatedCurrentConversation = state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, citations } : m
                ),
              }
            : state.currentConversation;
          
          return {
            conversations: updatedConversations,
            currentConversation: updatedCurrentConversation,
          };
        });
      },

      addSuggestions: (conversationId, messageId, suggestions) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, suggestions } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, suggestions } : m
                ),
              }
            : state.currentConversation,
        }));
      },

      removeMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.filter(m => m.id !== messageId),
                  updatedAt: Date.now(),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.filter(m => m.id !== messageId),
                updatedAt: Date.now(),
              }
            : state.currentConversation,
        }));
      },

      removeMessagePair: (conversationId, messageId) => {
        set((state) => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (!conversation) return state;

          const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
          if (messageIndex === -1) return state;

          const messageToDelete = conversation.messages[messageIndex];
          const messagesToRemove = [messageId];

          if (messageToDelete.role === 'assistant') {
            if (messageIndex > 0) {
              const userMessage = conversation.messages[messageIndex - 1];
              if (userMessage.role === 'user') {
                messagesToRemove.push(userMessage.id);
              }
            }
          } else if (messageToDelete.role === 'user') {
            if (messageIndex < conversation.messages.length - 1) {
              const assistantMessage = conversation.messages[messageIndex + 1];
              if (assistantMessage.role === 'assistant') {
                messagesToRemove.push(assistantMessage.id);
              }
            }
          }

          return {
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.filter(m => !messagesToRemove.includes(m.id)),
                    updatedAt: Date.now(),
                  }
                : c
            ),
            currentConversation: state.currentConversation?.id === conversationId
              ? {
                  ...state.currentConversation,
                  messages: state.currentConversation.messages.filter(m => !messagesToRemove.includes(m.id)),
                  updatedAt: Date.now(),
                }
              : state.currentConversation,
          };
        });
      },

      thumbsUpMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, thumbsUp: true, thumbsDown: false } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, thumbsUp: true, thumbsDown: false } : m
                ),
              }
            : state.currentConversation,
        }));
      },

      thumbsDownMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, thumbsUp: false, thumbsDown: true } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, thumbsUp: false, thumbsDown: true } : m
                ),
              }
            : state.currentConversation,
        }));
      },

      addAttachmentToMessage: (conversationId, messageId, attachment) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, attachments: [...(m.attachments || []), attachment] } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, attachments: [...(m.attachments || []), attachment] } : m
                ),
              }
            : state.currentConversation,
        }));
      },

      startStreaming: () => set({ streaming: true }),
      stopStreaming: () => set({ streaming: false }),

      setModel: async (model) => {
        const state = get();
        const previousModel = state.model;
        
        // Update the model
        set({ model });
        
        // Update all conversations to use the new model
        set((state) => ({
          conversations: state.conversations.map(c => ({ ...c, model })),
          currentConversation: state.currentConversation
            ? { ...state.currentConversation, model }
            : null
        }));
        
        // If we have a current conversation with messages, offer to regenerate
        if (state.currentConversation && 
            state.currentConversation.messages.length > 0 &&
            previousModel !== model) {
          
          // Check if there's a user message followed by an assistant message
          const messages = state.currentConversation.messages;
          const lastUserIndex = messages.findLastIndex(m => m.role === 'user');
          const lastAssistantIndex = messages.findLastIndex(m => m.role === 'assistant');
          
          if (lastUserIndex !== -1 && lastAssistantIndex > lastUserIndex) {
            // Auto-regenerate with new model
            setTimeout(() => {
              get().regenerateLastResponse(state.currentConversation!.id);
            }, 100);
          }
        }
      },

      regenerateLastResponse: async (conversationId: string) => {
        const state = get();
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (!conversation || conversation.messages.length === 0) return;

        // Find the last user message and assistant message
        const lastUserMessage = conversation.messages.filter(m => m.role === 'user').pop();
        const lastAssistantMessage = conversation.messages.filter(m => m.role === 'assistant').pop();
        
        if (!lastUserMessage || !lastAssistantMessage) return;

        // Remove the last assistant message
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.filter(m => m.id !== lastAssistantMessage.id)
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.filter(m => m.id !== lastAssistantMessage.id)
              }
            : state.currentConversation,
        }));

        // Start streaming with new model
        let newAssistantMessageId: string | undefined;
        try {
          const { chatAPI } = await import('@/lib/api');
          newAssistantMessageId = get().addMessage(conversationId, {
            role: 'assistant',
            content: '',
          });
          
          get().setMessageStreaming(conversationId, newAssistantMessageId, true);
          get().startStreaming();

          if (!newAssistantMessageId) {
            throw new Error('Failed to create new assistant message');
          }
          
          await chatAPI.streamChat(
            {
              message: lastUserMessage.content,
              model: get().model,
              conversationId,
            },
            (chunk) => {
              get().appendMessageContent(conversationId, newAssistantMessageId!, chunk);
            },
            (citations) => {
              console.log('regenerateLastResponse received citations:', citations);
              get().addCitations(conversationId, newAssistantMessageId!, citations);
            },
            (suggestions) => {
              get().addSuggestions(conversationId, newAssistantMessageId!, suggestions);
            },
            (conversationId) => {
              console.log('Regeneration completed for conversation:', conversationId);
            }
          );
        } catch (error) {
          console.error('Regeneration error:', error);
          // Add error message
          get().addMessage(conversationId, {
            role: 'assistant',
            content: 'Sorry, I encountered an error while regenerating the response. Please try again.',
          });
        } finally {
          if (newAssistantMessageId) {
            get().setMessageStreaming(conversationId, newAssistantMessageId, false);
          }
          get().stopStreaming();
        }
      },

      setShowFollowUps: (show) => set({ showFollowUps: show }),
      setMessageWidth: (width) => set({ messageWidth: width }),
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      createFolder: (name) => {
        const folder: Folder = {
          id: generateId(),
          name,
          conversationIds: [],
          createdAt: Date.now(),
        };
        set((state) => ({ folders: [...state.folders, folder] }));
      },

      renameFolder: (id, name) => {
        set((state) => ({
          folders: state.folders.map(f => 
            f.id === id ? { ...f, name } : f
          ),
        }));
      },

      deleteFolder: (id) => {
        set((state) => ({ folders: state.folders.filter(f => f.id !== id) }));
      },

      moveConversationToFolder: (conversationId, folderId) => {
        set((state) => ({
          folders: state.folders.map(f => {
            if (folderId && f.id === folderId) {
              return { ...f, conversationIds: [...f.conversationIds, conversationId] };
            }
            return { ...f, conversationIds: f.conversationIds.filter(id => id !== conversationId) };
          }),
        }));
      },

      removeConversationFromFolder: (conversationId) => {
        set((state) => ({
          folders: state.folders.map(f => ({
            ...f,
            conversationIds: f.conversationIds.filter(id => id !== conversationId),
          })),
        }));
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        model: state.model,

        showFollowUps: state.showFollowUps,
        messageWidth: state.messageWidth,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        folders: state.folders,
      }),
    }
  )
);