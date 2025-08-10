import { Citation } from '@/store/useChatStore';

const LIBRECHAT_BASE_URL = process.env.NEXT_PUBLIC_LIBRECHAT_BASE_URL || 'http://localhost:3080';
const LIBRECHAT_API_KEY = process.env.NEXT_PUBLIC_LIBRECHAT_API_KEY || '';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !LIBRECHAT_API_KEY;

console.log('API Configuration:', {
  baseURL: LIBRECHAT_BASE_URL,
  hasApiKey: !!LIBRECHAT_API_KEY,
  useMock: USE_MOCK_API
});

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

const mockCitations: Citation[] = [
  {
    id: 1,
    title: "Next.js Documentation - Getting Started",
    url: "https://nextjs.org/docs/getting-started",
    domain: "nextjs.org",
    favicon: "https://nextjs.org/favicon.ico",
    snippet: "Learn how to get started with Next.js, the React framework for production. Build full-stack web applications with the App Router."
  },
  {
    id: 2,
    title: "React Documentation - Hooks",
    url: "https://react.dev/reference/react/hooks",
    domain: "react.dev",
    favicon: "https://react.dev/favicon.ico",
    snippet: "Hooks are functions that let you use state and other React features in function components. Learn about useState, useEffect, and more."
  },
  {
    id: 3,
    title: "Tailwind CSS - Utility-First CSS Framework",
    url: "https://tailwindcss.com/docs",
    domain: "tailwindcss.com",
    favicon: "https://tailwindcss.com/favicon.ico",
    snippet: "A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design."
  },
  {
    id: 4,
    title: "TypeScript Handbook - Basic Types",
    url: "https://www.typescriptlang.org/docs/handbook/basic-types.html",
    domain: "typescriptlang.org",
    favicon: "https://www.typescriptlang.org/favicon.ico",
    snippet: "TypeScript adds optional types to JavaScript that support tools for large-scale JavaScript applications for any browser, for any host, on any OS."
  },
  {
    id: 5,
    title: "Node.js Documentation - Getting Started",
    url: "https://nodejs.org/en/docs/guides/getting-started-guide/",
    domain: "nodejs.org",
    favicon: "https://nodejs.org/static/images/favicon.ico",
    snippet: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model."
  },
  {
    id: 6,
    title: "GitHub - Git Cheat Sheet",
    url: "https://education.github.com/git-cheat-sheet-education.pdf",
    domain: "github.com",
    favicon: "https://github.com/favicon.ico",
    snippet: "A quick reference guide to the most commonly used Git commands. Perfect for beginners and experienced developers alike."
  },
  {
    id: 7,
    title: "MDN Web Docs - JavaScript Guide",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    domain: "developer.mozilla.org",
    favicon: "https://developer.mozilla.org/favicon-48x48.png",
    snippet: "The JavaScript Guide shows you how to use JavaScript and gives an overview of the language. If you need exhaustive information about a language feature."
  },
  {
    id: 8,
    title: "CSS-Tricks - Flexbox Complete Guide",
    url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
    domain: "css-tricks.com",
    favicon: "https://css-tricks.com/apple-touch-icon.png",
    snippet: "A complete guide to CSS flexbox. This comprehensive guide covers everything you need to know about flexbox layout."
  },
  {
    id: 9,
    title: "Stack Overflow - JavaScript Questions",
    url: "https://stackoverflow.com/questions/tagged/javascript",
    domain: "stackoverflow.com",
    favicon: "https://stackoverflow.com/favicon.ico",
    snippet: "Stack Overflow is the largest, most trusted online community for developers to learn, share their knowledge, and build their careers."
  },
  {
    id: 10,
    title: "W3Schools - HTML Tutorial",
    url: "https://www.w3schools.com/html/",
    domain: "w3schools.com",
    favicon: "https://www.w3schools.com/favicon.ico",
    snippet: "HTML is the standard markup language for Web pages. With HTML you can create your own Website. HTML is easy to learn."
  },
  {
    id: 11,
    title: "Dev.to - Web Development Articles",
    url: "https://dev.to/t/webdev",
    domain: "dev.to",
    favicon: "https://dev.to/assets/favicon-32x32.png",
    snippet: "Dev.to is a community of software developers getting together to help one another out. The software industry relies on collaboration and networked learning."
  }
];

const mockSuggestions = [
  "How do I deploy a Next.js app to Vercel?",
  "What are the best practices for React performance?",
  "How to implement dark mode in Tailwind CSS?",
  "What's the difference between SSR and SSG in Next.js?"
];

        async function* generateMockStream(message: string) {
          let response = `Here's a comprehensive answer about ${message.toLowerCase()}. This is a detailed explanation that covers all the important aspects you need to know [1]. The response includes multiple paragraphs with relevant information and examples [2]. You can find more details in the official documentation [3].`;
          
          // Add more citations to showcase 8 sources (reduced from 22)
          response += `\n\nFor advanced users, there are excellent resources on TypeScript [4] and Node.js [5] that provide deeper insights. If you're working with version control, GitHub offers comprehensive guides [6]. The Mozilla Developer Network [7] is an invaluable resource for web standards and best practices.`;
          
          response += `\n\nWhen it comes to CSS layout, Flexbox [8] is an essential tool. For community support and problem-solving, Stack Overflow [9] is an excellent platform. Learning platforms like W3Schools [10] offer structured courses.`;
          
          response += `\n\nFor rapid prototyping and testing, online editors are indispensable. Browser compatibility can be checked using various tools, while modern development practices are documented at multiple sources. Interactive learning makes CSS concepts fun and memorable.`;
          
          response += `\n\nJavaScript fundamentals are thoroughly covered at multiple resources. For React applications, routing solutions and state management are industry standards. Finally, deployment platforms make it easy to get your applications online.`;
          
          if (message.toLowerCase().includes('javascript') || message.toLowerCase().includes('js')) {
            response += `\n\nHere's a JavaScript example:\n\n\`\`\`javascript\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n\`\`\``;
          } else if (message.toLowerCase().includes('python')) {
            response += `\n\nHere's a Python example:\n\n\`\`\`python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet('World'))\n\`\`\``;
          } else if (message.toLowerCase().includes('react') || message.toLowerCase().includes('component')) {
            response += `\n\nHere's a React component example:\n\n\`\`\`jsx\nimport React from 'react';\n\nfunction Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\nexport default Greeting;\n\`\`\``;
          } else if (message.toLowerCase().includes('css') || message.toLowerCase().includes('style')) {
            response += `\n\nHere's a CSS example:\n\n\`\`\`css\n.button {\n  background-color: #007bff;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\`\`\``;
          }
          
          const chunks = response.split(' ');
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            yield chunk + ' ';
          }
        }

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
              } catch {
                
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

    // Don't add citations immediately - wait for streaming to start
    // This ensures Answer tab appears first, then Sources tab and cards

    try {
      for await (const chunk of generator) {
        if (abortSignal?.aborted) {
          throw new Error('Aborted');
        }
        
        console.log('Mock streaming chunk:', chunk);
        fullResponse += chunk;
        onChunk(chunk);
        
        // Add citations after first few chunks (when streaming has started)
        if (fullResponse.length > 50 && onCitations) {
          onCitations(mockCitations);
          // Clear the callback to prevent multiple calls
          onCitations = undefined;
        }
      }

      setTimeout(() => {
        onSuggestions?.(mockSuggestions);
      }, 500);

      setTimeout(() => {
        onComplete?.(conversationId);
      }, 1000);

      return fullResponse;
    } catch (error) {
      if (error instanceof Error && error.message === 'Aborted') {
        throw error;
      }
      console.error('Mock streaming error:', error);
      throw new Error('Mock streaming failed');
    }
  }

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

  async renameConversation(id: string, title: string): Promise<void> {
    if (this.useMock) {
      return;
    }

    await this.makeRequest(`/api/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(id: string): Promise<void> {
    if (this.useMock) {
      return;
    }

    await this.makeRequest(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  async getSuggestions(prompt: string): Promise<string[]> {
    if (this.useMock) {
      return mockSuggestions;
    }

    const response = await this.makeRequest(`/api/suggestions?prompt=${encodeURIComponent(prompt)}`);
    return response.json() as Promise<string[]>;
  }

  async getSources(messageId: string): Promise<Citation[]> {
    if (this.useMock) {
      return mockCitations;
    }

    const response = await this.makeRequest(`/api/sources?messageId=${messageId}`);
    return response.json() as Promise<Citation[]>;
  }

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
