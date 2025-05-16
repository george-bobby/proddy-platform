'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { EmptyNotes } from './empty-notes';
import { NotesSidebar } from './notes-sidebar';
import { NoteEditor } from './note-editor';
import { FolderDialog } from './folder-dialog';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { Note, NoteFolder } from '../types';

export const NotesContainer = () => {
  // Get workspace and channel IDs from URL params
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const channelId = params.channelId as string;

  // State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [selectedParentFolderId, setSelectedParentFolderId] = useState<Id<'noteFolders'> | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // Convex queries
  const notes = useQuery(api.notes.list, {
    workspaceId: workspaceId as Id<'workspaces'>,
    channelId: channelId as Id<'channels'>,
  }) || [];

  const folders = useQuery(api.noteFolders.list, {
    workspaceId: workspaceId as Id<'workspaces'>,
    channelId: channelId as Id<'channels'>,
  }) || [];

  const activeNote = activeNoteId
    ? notes?.find((note) => note._id === activeNoteId)
    : null;

  // Convex mutations
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);
  const createFolder = useMutation(api.noteFolders.create);
  const updateFolder = useMutation(api.noteFolders.update);
  const deleteFolder = useMutation(api.noteFolders.remove);

  // Handle note selection
  const handleNoteSelect = (noteId: string) => {
    setActiveNoteId(noteId);
  };

  // Handle note creation
  const handleCreateNote = async (folderId?: Id<'noteFolders'>) => {
    try {
      const noteId = await createNote({
        title: 'Untitled',
        content: JSON.stringify({ ops: [{ insert: '\n' }] }),
        workspaceId: workspaceId as Id<'workspaces'>,
        channelId: channelId as Id<'channels'>,
        folderId,
      });

      setActiveNoteId(noteId);
      toast.success('Note created');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  // Handle folder creation
  const handleCreateFolder = (parentFolderId?: Id<'noteFolders'>) => {
    setSelectedParentFolderId(parentFolderId);
    setCreateFolderDialogOpen(true);
  };

  const handleCreateFolderSubmit = async (name: string) => {
    try {
      await createFolder({
        name,
        workspaceId: workspaceId as Id<'workspaces'>,
        channelId: channelId as Id<'channels'>,
        parentFolderId: selectedParentFolderId,
      });

      toast.success('Folder created');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    try {
      console.log('Deleting note with ID:', noteId);

      // If the active note is being deleted, clear it first
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
      }

      await deleteNote({ id: noteId as Id<'notes'> });
      console.log('Note deleted successfully:', noteId);

      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Handle folder deletion (with cascading deletion of notes)
  const handleDeleteFolder = async (folderId: Id<'noteFolders'>) => {
    try {
      console.log('Deleting folder with ID:', folderId);

      // If the active note was in this folder, clear it first
      const noteInFolder = notes.find(note => note.folderId === folderId);
      if (noteInFolder && activeNoteId === noteInFolder._id) {
        setActiveNoteId(null);
      }

      // This will trigger cascading deletion in the backend
      await deleteFolder({ id: folderId });
      console.log('Folder deleted successfully:', folderId);

      toast.success('Folder and its contents deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Handle folder renaming
  const handleRenameFolder = async (folderId: Id<'noteFolders'>, name: string) => {
    try {
      await updateFolder({
        id: folderId,
        name,
      });

      toast.success('Folder renamed');
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    }
  };

  // Handle note moving (drag and drop)
  const handleMoveNote = async (noteId: Id<'notes'>, folderId?: Id<'noteFolders'>) => {
    try {
      await updateNote({
        id: noteId,
        folderId,
      });

      toast.success('Note moved');
    } catch (error) {
      console.error('Error moving note:', error);
      toast.error('Failed to move note');
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const noteId = active.id as Id<'notes'>;
      const folderId = over.id as Id<'noteFolders'>;

      handleMoveNote(noteId, folderId);
    }
  };

  // Handle note content and title updates
  const handleSaveNote = async (title: string, content: string) => {
    if (!activeNoteId) return;

    setIsEditing(true);

    try {
      await updateNote({
        id: activeNoteId as Id<'notes'>,
        title,
        content,
      });

      toast.success('Note saved');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsEditing(false);
    }
  };

  // Render empty state if no notes or folders
  if (notes.length === 0 && folders.length === 0) {
    return (
      <>
        <EmptyNotes
          onCreate={() => handleCreateNote()}
          onCreateFolder={() => handleCreateFolder()}
        />

        <FolderDialog
          isOpen={createFolderDialogOpen}
          onClose={() => setCreateFolderDialogOpen(false)}
          onSubmit={handleCreateFolderSubmit}
          title="Create Folder"
          description="Enter a name for your new folder."
        />
      </>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex h-full">
        <NotesSidebar
          notes={notes}
          folders={folders}
          activeNoteId={activeNoteId}
          onNoteSelect={handleNoteSelect}
          onCreateNote={handleCreateNote}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
          onMoveNote={handleMoveNote}
          onDeleteNote={handleDeleteNote}
          className="w-64 border-r"
        />

        <div className="flex-1">
          {activeNote ? (
            <NoteEditor
              title={activeNote.title}
              content={activeNote.content}
              onTitleChange={(title) => handleSaveNote(title, activeNote.content)}
              onContentChange={(content) => handleSaveNote(activeNote.title, content)}
              onSaveNote={() => handleSaveNote(activeNote.title, activeNote.content)}
              isLoading={isEditing}
              noteId={activeNote._id}
              workspaceId={workspaceId as Id<'workspaces'>}
              channelId={channelId as Id<'channels'>}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a note or create a new one
            </div>
          )}
        </div>

        <FolderDialog
          isOpen={createFolderDialogOpen}
          onClose={() => setCreateFolderDialogOpen(false)}
          onSubmit={handleCreateFolderSubmit}
          title="Create Folder"
          description="Enter a name for your new folder."
        />
      </div>
    </DndContext>
  );
};
