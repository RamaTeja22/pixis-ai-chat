'use client';

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ChatWelcome } from '@/components/ChatWelcome';
import { ChatMessages } from '@/components/ChatMessages';
import { PromptForm } from '@/components/PromptForm';
import { ContextPanel } from '@/components/ContextPanel';
import { useChatStore } from '@/store/useChatStore';

export default function Home() {
  const { currentConversation, sidebarOpen } = useChatStore();

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar - Collapsible */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 border-r bg-muted/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
      `}>
        <Sidebar />
      </aside>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => useChatStore.getState().setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex flex-col overflow-y-auto">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <ChatWelcome />
          ) : (
            <ChatMessages />
          )}
        </div>
        {/* Desktop prompt form */}
        <div className="hidden md:block p-4 border-t bg-background">
          <PromptForm />
        </div>
      </main>

      {/* Right Rail - Hidden on mobile */}
      <aside className="w-80 border-l bg-muted/30 hidden xl:block">
        <ContextPanel />
      </aside>

      {/* Mobile prompt form - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden z-50">
        <PromptForm />
      </div>
    </div>
  );
}