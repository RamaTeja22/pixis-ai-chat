'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Folder as FolderIcon, MessageSquare, Trash2, Edit, MoreHorizontal, FolderPlus } from 'lucide-react';
import { useChatStore, Conversation, Folder } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

// Skeleton loader component
const SkeletonList = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-8 w-full animate-pulse rounded-md bg-muted" />
    ))}
  </div>
);

// Sidebar item component with hover actions
const SidebarItem = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onMoveToFolder,
  folders,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string) => void;
  folders: Folder[];
}) => {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(conversation.title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      onRename(conversation.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewTitle(conversation.title);
      setIsRenaming(false);
    }
  };

  React.useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        group relative flex cursor-pointer items-center justify-between rounded-md p-2 text-sm transition-colors
        ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <MessageSquare className="h-4 w-4 shrink-0" />
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleRename}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{conversation.title}</span>
        )}
      </div>
      
      <div className="absolute right-2 flex items-center gap-1 rounded-md bg-accent p-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
          }}
          aria-label="Rename chat"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => e.stopPropagation()}
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {folders.length > 0 && (
              <>
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToFolder(conversation.id, folder.id);
                    }}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Move to &ldquo;{folder.name}&rdquo;
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

// Folder component
const FolderItem = ({
  folder,
  conversations,
  onSelectConversation,
  onRename,
  onDelete,
}: {
  folder: Folder;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const folderConversations = conversations.filter(c => 
    folder.conversationIds.includes(c.id)
  );

  return (
    <div className="space-y-1">
      <div 
        className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FolderIcon className="h-4 w-4" />
        <span className="flex-1">{folder.name}</span>
        <span className="text-xs text-muted-foreground">
          {folderConversations.length}
        </span>
      </div>
      
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {folderConversations.map((conversation) => (
            <SidebarItem
              key={conversation.id}
              conversation={conversation}
              isActive={false}
              onSelect={() => onSelectConversation(conversation.id)}
              onRename={onRename}
              onDelete={onDelete}
              onMoveToFolder={() => {}} // Not needed for conversations already in folders
              folders={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    folders,
    createConversation,
    deleteConversation,
    renameConversation,
    setCurrentConversation,
    createFolder,
    deleteFolder,
    moveConversationToFolder,
  } = useChatStore();

  const handleNewChat = () => {
    createConversation();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
  };

  const handleRename = (id: string, newTitle: string) => {
    renameConversation(id, newTitle);
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
  };

  const handleMoveToFolder = (conversationId: string, folderId: string) => {
    moveConversationToFolder(conversationId, folderId);
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      createFolder(name.trim());
    }
  };

  // Get conversations not in folders
  const unassignedConversations = conversations.filter(conversation => 
    !folders.some(folder => folder.conversationIds.includes(conversation.id))
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
        <Button className="w-full justify-start gap-2" onClick={handleNewChat}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
          Recent
        </h2>
        <Suspense fallback={<SkeletonList />}>
          <AnimatePresence>
            <div className="space-y-1">
              {unassignedConversations.map((conversation) => (
                <SidebarItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={currentConversationId === conversation.id}
                  onSelect={() => handleSelectConversation(conversation.id)}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onMoveToFolder={handleMoveToFolder}
                  folders={folders}
                />
              ))}
            </div>
          </AnimatePresence>
        </Suspense>
      </div>

      <div className="mt-auto border-t p-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Folders</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={handleCreateFolder}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 space-y-1">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}