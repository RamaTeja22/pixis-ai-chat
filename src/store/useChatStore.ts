import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Citation = {
  id: number;
  title: string;
  url: string;
  domain: string;
  favicon?: string;
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
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  
  // UI State
  streaming: boolean;
  model: string;
  showSources: boolean;
  showFollowUps: boolean;
  messageWidth: 'compact' | 'comfortable' | 'wide';
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  // Actions
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setCurrentConversation: (id: string) => void;
  
        // Messages
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
  
  // Streaming
  startStreaming: () => void;
  stopStreaming: () => void;
  
  // Settings
  setModel: (model: string) => void;
  setShowSources: (show: boolean) => void;
  setShowFollowUps: (show: boolean) => void;
  setMessageWidth: (width: 'compact' | 'comfortable' | 'wide') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Folders
  folders: Folder[];
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  moveConversationToFolder: (conversationId: string, folderId: string) => void;
  removeConversationFromFolder: (conversationId: string) => void;
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversationId: null,
      currentConversation: null,
      streaming: false,
      model: 'Balanced',
      showSources: true,
      showFollowUps: true,
      messageWidth: 'comfortable',
      theme: 'system',
      sidebarOpen: true,
      folders: [],

      // Conversation actions
      createConversation: (title = 'New Chat') => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: get().model,
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

      // Message actions
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
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content: m.content + contentChunk } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, content: m.content + contentChunk } : m
                ),
              }
            : state.currentConversation,
        }));
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
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, citations } : m
                  ),
                }
              : c
          ),
          currentConversation: state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(m =>
                  m.id === messageId ? { ...m, citations } : m
                ),
              }
            : state.currentConversation,
        }));
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
            // If deleting an assistant message, also delete the preceding user message
            if (messageIndex > 0) {
              const userMessage = conversation.messages[messageIndex - 1];
              if (userMessage.role === 'user') {
                messagesToRemove.push(userMessage.id);
              }
            }
          } else if (messageToDelete.role === 'user') {
            // If deleting a user message, also delete the following assistant message
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

      // Streaming
      startStreaming: () => set({ streaming: true }),
      stopStreaming: () => set({ streaming: false }),

      // Settings
      setModel: (model) => set({ model }),
      setShowSources: (show) => set({ showSources: show }),
      setShowFollowUps: (show) => set({ showFollowUps: show }),
      setMessageWidth: (width) => set({ messageWidth: width }),
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Folders
      createFolder: (name) => {
        const folder: Folder = {
          id: generateId(),
          name,
          conversationIds: [],
          createdAt: Date.now(),
        };
        set((state) => ({ folders: [...state.folders, folder] }));
      },

      deleteFolder: (id) => {
        set((state) => ({ folders: state.folders.filter(f => f.id !== id) }));
      },

      moveConversationToFolder: (conversationId, folderId) => {
        set((state) => ({
          folders: state.folders.map(f => {
            if (f.id === folderId) {
              return { ...f, conversationIds: [...f.conversationIds, conversationId] };
            }
            // Remove from other folders
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
        showSources: state.showSources,
        showFollowUps: state.showFollowUps,
        messageWidth: state.messageWidth,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        folders: state.folders,
      }),
    }
  )
);