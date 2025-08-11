'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Folder as FolderIcon, MessageSquare, Trash2, Edit, MoreHorizontal, FolderPlus } from 'lucide-react';
import { useChatStore, Conversation, Folder } from '@/store/useChatStore';
import { motion, AnimatePresence } from 'framer-motion';

const SkeletonList = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-8 w-full animate-pulse rounded-md bg-muted" />
    ))}
  </div>
);

const SidebarItem = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onMoveToFolder,
  onMoveOutOfFolder,
  folders,
  currentFolderId,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string) => void;
  onMoveOutOfFolder: (conversationId: string) => void;
  folders: Folder[];
  currentFolderId?: string;
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
            {currentFolderId && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveOutOfFolder(conversation.id);
                }}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                Move out of folder
              </DropdownMenuItem>
            )}
            {folders.length > 0 && (
              <>
                {folders.filter(f => f.id !== currentFolderId).map((folder) => (
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

const FolderItem = ({
  folder,
  conversations,
  onSelectConversation,
  onRename,
  onDelete,
  onRenameFolder,
  onDeleteFolder,
}: {
  folder: Folder;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(folder.name);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const folderConversations = conversations.filter(c => 
    folder.conversationIds.includes(c.id)
  );

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onRenameFolder(folder.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(folder.name);
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
    <div className="space-y-1">
      <div 
        className="group relative flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FolderIcon className="h-4 w-4" />
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleRename}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1">{folder.name}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {folderConversations.length}
        </span>
       
        <div className="absolute right-2 flex items-center gap-1 rounded-md bg-accent p-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
            aria-label="Rename folder"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder.id);
            }}
            aria-label="Delete folder"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
              onMoveToFolder={() => {}} 
              onMoveOutOfFolder={() => {}} 
              folders={[]}
              currentFolderId={folder.id}
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
    renameFolder,
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

  const handleRenameFolder = (id: string, newName: string) => {
    renameFolder(id, newName);
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('Are you sure you want to delete this folder? All conversations in it will be moved to the main list.')) {
      deleteFolder(id);
    }
  };

  const handleMoveOutOfFolder = (conversationId: string) => {
    moveConversationToFolder(conversationId, '');
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      createFolder(name.trim());
    }
  };

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
                  onMoveOutOfFolder={handleMoveOutOfFolder}
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
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          ))}
        </div>
      </div>
    </div>
  );
}