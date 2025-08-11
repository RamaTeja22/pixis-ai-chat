'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Folder, ChevronsUpDown, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { SettingsModal } from './SettingsModal';

// Model selector component
function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (model: string) => void;
}) {
  const models = ['Balanced', 'Creative', 'Precise'];
  const [isChanging, setIsChanging] = React.useState(false);
  
  const handleModelChange = async (newModel: string) => {
    if (newModel === value) return;
    
    setIsChanging(true);
    await onChange(newModel);
    
    // Keep the indicator for a bit longer to show regeneration is happening
    setTimeout(() => setIsChanging(false), 2000);
  };
  
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-lg font-semibold">
            <span>{value}</span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {models.map((model) => (
            <DropdownMenuItem key={model} onSelect={() => handleModelChange(model)}>
              {model}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Regeneration indicator */}
      {isChanging && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full animate-pulse">
          <Sparkles className="w-3 h-3" />
          Regenerating...
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { model, setModel, createConversation, sidebarOpen, setSidebarOpen } = useChatStore();

  const handleNewChat = () => {
    createConversation();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 flex items-center justify-between h-16 shrink-0">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          className="lg:hidden hover:bg-muted"
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </Button>
        <ModelSelector value={model} onChange={setModel} />
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 px-4 hover:bg-muted"
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" aria-label="History">
          <Folder className="h-4 w-4" />
        </Button>
        <SettingsModal />
      </div>
    </header>
  );
}