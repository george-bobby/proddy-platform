'use client';

import { FileText, Trash } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface Note {
  _id: Id<'notes'>;
  title: string;
  folderId?: Id<'noteFolders'>;
}

interface DraggableNoteProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (noteId: Id<'notes'>, event: React.MouseEvent) => void;
}

export const DraggableNote = ({
  note,
  isActive,
  onClick,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect
}: DraggableNoteProps) => {
  // Set up draggable with dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note._id,
    data: {
      type: 'note',
      note,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
  };

  // Stop propagation to prevent triggering the onClick handler
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  // Handle click based on selection mode
  const handleClick = () => {
    if (!isSelectionMode) {
      onClick();
    }
  };

  // Handle selection toggle
  const handleToggleSelect = (e: React.MouseEvent) => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(note._id, e);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isSelectionMode ? {} : { ...listeners, ...attributes })}
      className={cn(
        'flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 transition-colors',
        isActive ? 'bg-primary/10' : 'hover:bg-gray-100',
        isSelected ? 'bg-primary/20 border border-primary' : '',
        'touch-manipulation'
      )}
      onClick={handleClick}
    >
      <div className="flex items-center overflow-hidden">
        {isSelectionMode ? (
          <div
            className={cn(
              "w-4 h-4 mr-2 rounded border flex-shrink-0",
              isSelected ? "bg-primary border-primary" : "border-gray-300"
            )}
            onClick={handleToggleSelect}
          />
        ) : (
          <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
        )}
        <span className="truncate">{note.title || 'Untitled'}</span>
      </div>

      {!isSelectionMode && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDeleteClick}
          title="Delete note"
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
