import { Citation, Message } from '@/store/useChatStore';

// Environment configuration
const LIBRECHAT_BASE_URL = process.env.NEXT_PUBLIC_LIBRECHAT_BASE_URL || 'http://localhost:3080';
const LIBRECHAT_API_KEY = process.env.NEXT_PUBLIC_LIBRECHAT_API_KEY || '';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !LIBRECHAT_API_KEY;

// Log configuration for debugging
console.log('API Configuration:', {
  baseURL: LIBRECHAT_BASE_URL,
  hasApiKey: !!LIBRECHAT_API_KEY,
  useMock: USE_MOCK_API
});

// Types
export interface ChatRequest {
  message: string;
  model?: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  citations?: Citation[];
  suggestions?: string[];
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for development
const mockCitations: Citation[] = [
  {
    id: 1,
    title: "Next.js Documentation - Getting Started",
    url: "https://nextjs.org/docs/getting-started",
    domain: "nextjs.org",
    favicon: "https://nextjs.org/favicon.ico"
  },
  {
    id: 2,
    title: "React Documentation - Hooks",
    url: "https://react.dev/reference/react/hooks",
    domain: "react.dev",
    favicon: "https://react.dev/favicon.ico"
  },
  {
    id: 3,
    title: "Tailwind CSS - Utility-First CSS Framework",
    url: "https://tailwindcss.com/docs",
    domain: "tailwindcss.com",
    favicon: "https://tailwindcss.com/favicon.ico"
  }
];

const mockSuggestions = [
  "How do I deploy a Next.js app to Vercel?",
  "What are the best practices for React performance?",
  "How to implement dark mode in Tailwind CSS?",
  "What's the difference between SSR and SSG in Next.js?"
];

// Mock streaming response generator
async function* generateMockStream(message: string) {
  const response = `Here's a comprehensive answer about ${message.toLowerCase()}. This is a detailed explanation that covers all the important aspects you need to know [1]. The response includes multiple paragraphs with relevant information and examples [2]. You can find more details in the official documentation [3].`;
  
  const chunks = response.split(' ');
  for (const chunk of chunks) {
    // Simulate realistic typing speed
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    yield chunk + ' ';
  }
}

// API class
class ChatAPI {
  private baseURL: string;
  private apiKey: string;
  private useMock: boolean;

  constructor() {
    this.baseURL = LIBRECHAT_BASE_URL;
    this.apiKey = LIBRECHAT_API_KEY;
    this.useMock = USE_MOCK_API;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (this.useMock) {
      throw new Error('Mock mode - no real API calls');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Stream chat response
  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onCitations?: (citations: Citation[]) => void,
    onSuggestions?: (suggestions: string[]) => void,
    onComplete?: (conversationId: string) => void,
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (this.useMock) {
      return this.mockStreamChat(request, onChunk, onCitations, onSuggestions, onComplete, abortSignal);
    }

    try {
      const response = await this.makeRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify(request),
        signal: abortSignal,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let conversationId = '';
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                onComplete?.(conversationId);
                return fullResponse;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content') {
                  fullResponse += parsed.content;
                  onChunk(parsed.content);
                } else if (parsed.type === 'citations') {
                  onCitations?.(parsed.citations);
                } else if (parsed.type === 'suggestions') {
                  onSuggestions?.(parsed.suggestions);
                } else if (parsed.conversationId) {
                  conversationId = parsed.conversationId;
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Streaming error:', error);
      throw new Error('Failed to stream chat response');
    }
  }

  // Mock streaming implementation
  private async mockStreamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onCitations?: (citations: Citation[]) => void,
    onSuggestions?: (suggestions: string[]) => void,
    onComplete?: (conversationId: string) => void,
    abortSignal?: AbortSignal
  ): Promise<string> {
    console.log('Starting mock streaming for:', request.message);
    const generator = generateMockStream(request.message);
    let fullResponse = '';
    const conversationId = `mock-${Date.now()}`;

    try {
      for await (const chunk of generator) {
        if (abortSignal?.aborted) {
          throw new Error('Aborted');
        }
        
        console.log('Mock streaming chunk:', chunk);
        fullResponse += chunk;
        onChunk(chunk);
      }

      // Add citations and suggestions after a delay
      setTimeout(() => {
        onCitations?.(mockCitations);
      }, 1000);

      setTimeout(() => {
        onSuggestions?.(mockSuggestions);
      }, 1500);

      setTimeout(() => {
        onComplete?.(conversationId);
      }, 2000);

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.message === 'Aborted') {
        throw error;
      }
      console.error('Mock streaming error:', error);
      throw new Error('Mock streaming failed');
    }
  }

  // Get conversations list
  async getConversations(): Promise<Conversation[]> {
    if (this.useMock) {
      return [
        {
          id: '1',
          title: 'Getting started with Next.js',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Tailwind CSS best practices',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }

    const response = await this.makeRequest('/api/conversations');
    return response.json();
  }

  // Create conversation
  async createConversation(title: string): Promise<Conversation> {
    if (this.useMock) {
      return {
        id: `mock-${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const response = await this.makeRequest('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return response.json();
  }

  // Rename conversation
  async renameConversation(id: string, title: string): Promise<void> {
    if (this.useMock) {
      return;
    }

    await this.makeRequest(`/api/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  }

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    if (this.useMock) {
      return;
    }

    await this.makeRequest(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  // Get suggestions
  async getSuggestions(prompt: string): Promise<string[]> {
    if (this.useMock) {
      return mockSuggestions;
    }

    const response = await this.makeRequest(`/api/suggestions?prompt=${encodeURIComponent(prompt)}`);
    return response.json() as Promise<string[]>;
  }

  // Get sources for a message
  async getSources(messageId: string): Promise<Citation[]> {
    if (this.useMock) {
      return mockCitations;
    }

    const response = await this.makeRequest(`/api/sources?messageId=${messageId}`);
    return response.json() as Promise<Citation[]>;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    if (this.useMock) {
      return true;
    }

    try {
      await this.makeRequest('/api/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const chatAPI = new ChatAPI();
