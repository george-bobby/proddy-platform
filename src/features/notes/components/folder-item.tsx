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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Id } from '@/../convex/_generated/dataModel';

interface FolderItemProps {
  folder: NoteFolder;
  notes: Note[];
  subfolders: FolderItemProps[];
  activeNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onDeleteNote?: (noteId: string, e: React.MouseEvent) => void;
  onCreateNote: (folderId: Id<'noteFolders'>) => void;
  onCreateFolder: (parentFolderId: Id<'noteFolders'>) => void;
  onDeleteFolder: (folderId: Id<'noteFolders'>) => void;
  onRenameFolder: (folder: NoteFolder) => void;
  onDrop?: (noteId: string, folderId: Id<'noteFolders'>) => void;
  level?: number;
  isOpen?: boolean;
  className?: string;
}

export const FolderItem = ({
  folder,
  notes,
  subfolders,
  activeNoteId,
  onNoteSelect,
  onDeleteNote,
  onCreateNote,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onDrop,
  level = 0,
  isOpen: initialIsOpen = false,
  className,
}: FolderItemProps) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
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
    if (noteId && onDrop) {
      onDrop(noteId, folder._id);
    }
  };

  return (
    <div className="mb-1">
      <div
        className={cn(
          'flex items-center p-2 rounded-md cursor-pointer transition-colors',
          isDragOver ? 'bg-primary/20' : 'hover:bg-gray-100',
          className
        )}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
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

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
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
                  onCreateFolder(folder._id);
                }}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameFolder(folder);
                }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder._id);
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
        <div className="mt-1">
          {/* Render subfolders */}
          {subfolders.map((subfolder) => (
            <FolderItem
              key={subfolder.folder._id}
              folder={subfolder.folder}
              notes={subfolder.notes}
              subfolders={subfolder.subfolders}
              activeNoteId={activeNoteId}
              onNoteSelect={onNoteSelect}
              onDeleteNote={onDeleteNote}
              onCreateNote={onCreateNote}
              onCreateFolder={onCreateFolder}
              onDeleteFolder={onDeleteFolder}
              onRenameFolder={onRenameFolder}
              onDrop={onDrop}
              level={level + 1}
            />
          ))}

          {/* Render notes */}
          {notes.map((note) => (
            <div 
              key={note._id} 
              style={{ paddingLeft: `${(level * 12) + 20}px` }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('noteId', note._id);
              }}
            >
              <NoteItem
                note={note}
                isActive={activeNoteId === note._id}
                onClick={() => onNoteSelect(note._id)}
                onDelete={onDeleteNote ? (noteId, e) => onDeleteNote(noteId, e) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
