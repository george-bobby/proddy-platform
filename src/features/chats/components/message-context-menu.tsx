'use client';

import { Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextMenu } from '../contexts/context-menu-context';
import { useMessageSelection } from '@/features/smart/contexts/message-selection-context';
import type { Id } from '../../../../convex/_generated/dataModel';

interface MessageContextMenuProps {
  messageId: Id<'messages'>;
  isAuthor: boolean;
  isSelected: boolean;
  hideThreadButton?: boolean;
  onAction: (action: string) => void;
}

export const MessageContextMenu = ({
  messageId,
  isAuthor,
  isSelected,
  hideThreadButton,
  onAction,
}: MessageContextMenuProps) => {
  const { contextMenu, closeContextMenu } = useContextMenu();
  const { selectedMessages } = useMessageSelection();

  if (!contextMenu.show || contextMenu.messageId !== messageId) {
    return null;
  }

  const handleAction = (action: string) => {
    onAction(action);
    closeContextMenu();
  };

  return (
    <div
      className="context-menu fixed bg-white border rounded-lg shadow-lg py-1 z-[9999] min-w-[160px]"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className={cn(
          "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2",
          isSelected && "bg-blue-50 text-blue-600"
        )}
        onClick={() => handleAction('select')}
      >
        {isSelected ? '✓ Selected' : 'Select Message'}
      </button>
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
        onClick={() => handleAction('copy')}
      >
        Copy Message
      </button>
      {selectedMessages.length > 0 && (
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
          onClick={() => handleAction('summarize')}
        >
          <Sparkles className="h-4 w-4" />
          Summarize Selected
        </button>
      )}
      <hr className="my-1" />
      <button
        className="w-full px-3 py-2 text-left text-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 font-medium"
        onClick={() => handleAction('addToTask')}
      >
        <Plus className="h-4 w-4" />
        Add as Task
      </button>
      <hr className="my-1" />
      {isAuthor && (
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
          onClick={() => handleAction('edit')}
        >
          Edit
        </button>
      )}
      {isAuthor && (
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive"
          onClick={() => handleAction('delete')}
        >
          Delete
        </button>
      )}
      {!hideThreadButton && (
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
          onClick={() => handleAction('reply')}
        >
          Reply in Thread
        </button>
      )}
    </div>
  );
};
