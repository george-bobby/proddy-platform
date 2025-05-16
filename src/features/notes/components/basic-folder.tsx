'use client';

import { useState } from 'react';
import { Folder, FolderOpen, FileText, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Id } from '@/../convex/_generated/dataModel';

interface Note {
  _id: Id<'notes'>;
  title: string;
  folderId?: Id<'noteFolders'>;
}

interface BasicFolderProps {
  id: Id<'noteFolders'>;
  name: string;
  notes?: Note[];
  activeNoteId?: Id<'notes'> | null;
  onCreateNote: (folderId: Id<'noteFolders'>) => void;
  onNoteSelect?: (noteId: Id<'notes'>) => void;
  onDelete: () => void;
  onDropNote?: (noteId: Id<'notes'>, folderId: Id<'noteFolders'>) => void;
}

export const BasicFolder = ({
  id,
  name,
  notes = [],
  activeNoteId,
  onCreateNote,
  onNoteSelect,
  onDelete,
  onDropNote
}: BasicFolderProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Debug: Log the notes this folder has
  console.log(`Folder "${name}" has ${notes.length} notes:`, notes.map(note => note.title || 'Untitled'));

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleAddNote = () => {
    console.log('Creating note in folder:', name, 'with ID:', id);
    onCreateNote(id);
  };

  // State for drag and drop
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drag and drop
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
    if (noteId && onDropNote) {
      onDropNote(noteId as Id<'notes'>, id);
    }
  };

  return (
    <div
      className={`mb-2 ${isDragOver ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center p-2 rounded-md hover:bg-gray-100">
        <div className="flex items-center flex-1 cursor-pointer" onClick={toggleOpen}>
          {isOpen ? (
            <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 mr-2 text-blue-500" />
          )}
          <span className="font-medium">{name}</span>
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAddNote}
            title="Add note"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500"
            onClick={onDelete}
            title="Delete folder"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="ml-6 space-y-1 mt-1">
          {notes.length > 0 ? (
            <>
              {notes.map((note) => {
                const handleDeleteClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (onNoteSelect) {
                    // First select the note to ensure it's loaded
                    onNoteSelect(note._id);
                    // Then trigger delete after a short delay
                    setTimeout(() => {
                      const deleteEvent = new CustomEvent('delete-note', { detail: { noteId: note._id } });
                      document.dispatchEvent(deleteEvent);
                    }, 100);
                  }
                };

                return (
                  <div
                    key={note._id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${activeNoteId === note._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                    onClick={() => onNoteSelect && onNoteSelect(note._id)}
                  >
                    <div className="flex items-center overflow-hidden">
                      <FileText className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                      <span className="truncate">{note.title || 'Untitled'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={handleDeleteClick}
                      title="Delete note"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-sm text-muted-foreground p-2">
              No notes in this folder yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};
