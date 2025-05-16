'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreHorizontal, Trash, Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NoteItem } from './note-item';
import { DraggableNote } from './draggable-note';
import { NoteFolder, Note } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Id } from '@/../convex/_generated/dataModel';
import { useDroppable } from '@dnd-kit/core';

interface DraggableFolderProps {
  folder: NoteFolder;
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNote: (folderId: Id<'noteFolders'>) => void;
  onDeleteFolder: (folderId: Id<'noteFolders'>) => void;
  onRenameFolder: (folderId: Id<'noteFolders'>, name: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (folderId: Id<'noteFolders'>, event: React.MouseEvent) => void;
  selectedNotes?: Id<'notes'>[];
  onToggleNoteSelect?: (noteId: Id<'notes'>, event: React.MouseEvent) => void;
}

export const DraggableFolder = ({
  folder,
  notes,
  activeNoteId,
  onNoteSelect,
  onDeleteNote,
  onCreateNote,
  onDeleteFolder,
  onRenameFolder,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  selectedNotes = [],
  onToggleNoteSelect,
}: DraggableFolderProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Set up droppable area for the folder
  const { setNodeRef, isOver } = useDroppable({
    id: folder._id,
    data: {
      type: 'folder',
      accepts: ['note'],
    },
  });

  const toggleFolder = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If in selection mode, we need to handle it differently
    if (isSelectionMode) {
      // This is a workaround to exit selection mode before creating a note
      e.stopPropagation();
      // We can't directly access the selection mode state here, so we'll just call the function
      onCreateNote(folder._id);
    } else {
      onCreateNote(folder._id);
    }
  };

  const handleRenameFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Enter new folder name:', folder.name);
    if (newName && newName.trim() !== '') {
      onRenameFolder(folder._id, newName);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the folder "${folder.name}" and all its notes?`)) {
      onDeleteFolder(folder._id);
    }
  };

  // Handle selection toggle
  const handleToggleSelect = (e: React.MouseEvent) => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(folder._id, e);
    }
  };

  return (
    <div className="mb-2">
      <div
        ref={setNodeRef}
        className={cn(
          'flex items-center p-2 rounded-md cursor-pointer transition-colors',
          isOver ? 'bg-primary/20' : 'hover:bg-gray-100',
          isSelected ? 'bg-primary/20 border border-primary' : '',
          'group'
        )}
        onClick={isSelectionMode ? handleToggleSelect : toggleFolder}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          {isSelectionMode ? (
            <div
              className={cn(
                "w-4 h-4 mr-2 rounded border flex-shrink-0",
                isSelected ? "bg-primary border-primary" : "border-gray-300"
              )}
              onClick={handleToggleSelect}
            />
          ) : (
            <>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground" />
              )}
            </>
          )}

          {isOpen ? (
            <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          )}
          <span className="font-medium truncate">{folder.name}</span>
        </div>

        {!isSelectionMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-gray-200"
              onClick={handleCreateNote}
              title="Create note in this folder"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-gray-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleRenameFolder}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteFolder}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="mt-1 ml-6">
          {notes.map((note) => (
            <DraggableNote
              key={note._id}
              note={note}
              isActive={activeNoteId === note._id}
              onClick={() => onNoteSelect(note._id)}
              onDelete={() => onDeleteNote(note._id)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedNotes.includes(note._id)}
              onToggleSelect={onToggleNoteSelect}
            />
          ))}

          {notes.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-1">
              No notes in this folder
            </p>
          )}
        </div>
      )}
    </div>
  );
};
