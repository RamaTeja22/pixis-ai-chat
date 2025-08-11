'use client';

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ChatWelcome } from '@/components/ChatWelcome';
import { PromptForm } from '@/components/PromptForm';
import { useChatStore } from '@/store/useChatStore';
import ChatMessages from "@/components/ChatMessages";
import { Sparkles } from 'lucide-react';
import React from 'react';

function RegenerationNotification() {
  const { model, streaming } = useChatStore();
  const [showNotification, setShowNotification] = React.useState(false);
  const [previousModel, setPreviousModel] = React.useState(model);
  
  React.useEffect(() => {
    if (model !== previousModel && streaming) {
      setShowNotification(true);
      setPreviousModel(model);
      
      setTimeout(() => setShowNotification(false), 4000);
    }
  }, [model, streaming, previousModel]);
  
  if (!showNotification) return null;
  
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg animate-in slide-in-from-top-2 duration-300">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">
          Regenerating with {model} model...
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { currentConversation, sidebarOpen } = useChatStore();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <RegenerationNotification />
      
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 border-r bg-muted/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:translate-x-0
      `}>
        <Sidebar />
      </aside>
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => useChatStore.getState().setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden pr-6">
        <Header />
        <div className="flex-1 flex flex-col overflow-y-auto">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <ChatWelcome />
          ) : (
            <ChatMessages />
          )}
        </div>
        
        {currentConversation && currentConversation.messages.length > 0 && (
          <div className="p-6 border-t bg-background">
            <div className="max-w-4xl mx-auto">
              <PromptForm />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}