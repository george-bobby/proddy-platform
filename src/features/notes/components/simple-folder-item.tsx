'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreHorizontal, Trash, Edit, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NoteItem } from './note-item';
import { NoteFolder, Note } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Id } from '@/../convex/_generated/dataModel';

interface SimpleFolderItemProps {
  folder: NoteFolder;
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onCreateNote: (folderId: Id<'noteFolders'>) => void;
  onDeleteFolder: (folderId: Id<'noteFolders'>) => void;
  onRenameFolder: (folderId: Id<'noteFolders'>, name: string) => void;
  onMoveNote: (noteId: Id<'notes'>, folderId?: Id<'noteFolders'>) => void;
}

export const SimpleFolderItem = ({
  folder,
  notes,
  activeNoteId,
  onNoteSelect,
  onDeleteNote,
  onCreateNote,
  onDeleteFolder,
  onRenameFolder,
  onMoveNote,
}: SimpleFolderItemProps) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open
  const [isDragOver, setIsDragOver] = useState(false);

  const toggleFolder = () => {
    setIsOpen(!isOpen);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      onMoveNote(noteId as Id<'notes'>, folder._id);
    }
  };

  return (
    <div className="mb-2">
      <div
        className={cn(
          'flex items-center p-2 rounded-md cursor-pointer transition-colors',
          isDragOver ? 'bg-primary/20' : 'hover:bg-gray-100',
          'group'
        )}
        onClick={toggleFolder}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0 text-muted-foreground" />
          )}
          {isOpen ? (
            <FolderOpen className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
          )}
          <span className="font-medium truncate">{folder.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
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
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateNote(folder._id);
                }}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt('Enter new folder name:', folder.name);
                  if (newName && newName.trim() !== '') {
                    onRenameFolder(folder._id, newName);
                  }
                }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this folder?')) {
                    onDeleteFolder(folder._id);
                  }
                }}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isOpen && (
        <div className="mt-1 ml-6">
          {/* Render notes */}
          {notes.map((note) => (
            <div 
              key={note._id} 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('noteId', note._id);
              }}
            >
              <NoteItem
                note={note}
                isActive={activeNoteId === note._id}
                onClick={() => onNoteSelect(note._id)}
                onDelete={onDeleteNote ? (noteId) => onDeleteNote(noteId) : undefined}
              />
            </div>
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
