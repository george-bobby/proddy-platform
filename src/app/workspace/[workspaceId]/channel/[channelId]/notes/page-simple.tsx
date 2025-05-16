'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { FileText, Plus, FolderPlus, Save } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { EmptyNotes } from '@/features/notes/components/empty-notes';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { FolderDialog } from '@/features/notes/components/folder-dialog';

const NotesPage = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as Id<'workspaces'>;
  const channelId = params.channelId as Id<'channels'>;

  // State
  const [activeNoteId, setActiveNoteId] = useState<Id<'notes'> | null>(null);
  const [title, setTitle] = useState('Untitled');
  const [content, setContent] = useState(JSON.stringify({ ops: [{ insert: '\n' }] }));
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  // Convex queries
  const notes = useQuery(api.notes.list, {
    workspaceId,
    channelId,
  }) || [];

  const folders = useQuery(api.noteFolders.list, {
    workspaceId,
    channelId,
  }) || [];

  // Get active note
  const activeNote = useQuery(
    api.notes.get,
    activeNoteId ? { id: activeNoteId } : 'skip'
  );

  // Convex mutations
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const createFolder = useMutation(api.noteFolders.create);

  // Update title and content when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    }
  }, [activeNote]);

  // Handle note creation
  const handleCreateNote = async () => {
    try {
      const defaultTitle = 'Untitled';
      const defaultContent = JSON.stringify({ ops: [{ insert: '\n' }] });

      // Create the note in Convex
      const noteId = await createNote({
        title: defaultTitle,
        content: defaultContent,
        workspaceId,
        channelId,
      });

      if (noteId) {
        // Set the active note ID
        setActiveNoteId(noteId);

        // Set title and content
        setTitle(defaultTitle);
        setContent(defaultContent);

        toast.success('Note created');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  // Handle folder creation
  const handleCreateFolder = async (name: string) => {
    try {
      const folderName = name && name.trim() !== '' ? name : 'New Folder';

      // Close the dialog
      setIsFolderDialogOpen(false);

      // Create the folder in Convex
      await createFolder({
        name: folderName,
        workspaceId,
        channelId,
      });

      toast.success(`Folder "${folderName}" created`);
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Handle note selection
  const handleNoteSelect = (noteId: Id<'notes'>) => {
    setActiveNoteId(noteId);
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // Handle save
  const handleSaveNote = async () => {
    if (!activeNoteId) return;

    try {
      await updateNote({
        id: activeNoteId,
        title,
        content,
      });

      toast.success('Note saved');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    }
  };

  // Show empty state if no notes and no folders
  if (notes.length === 0 && folders.length === 0) {
    return (
      <>
        <EmptyNotes
          onCreate={handleCreateNote}
          onCreateFolder={() => setIsFolderDialogOpen(true)}
        />
        <FolderDialog
          isOpen={isFolderDialogOpen}
          onClose={() => setIsFolderDialogOpen(false)}
          onSubmit={handleCreateFolder}
          title="Create Folder"
          description="Enter a name for your new folder"
        />
      </>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-64 h-full border-r overflow-y-auto p-4">
        {/* Folders section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground">FOLDERS</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsFolderDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {folders.length > 0 ? (
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder._id}
                  className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="truncate">{folder.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">
              No folders yet - Click + to create one
            </div>
          )}
        </div>

        {/* Notes section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground">NOTES</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleCreateNote}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {notes.length > 0 ? (
            <div className="space-y-1">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${activeNoteId === note._id ? 'bg-primary/10' : 'hover:bg-gray-100'
                    }`}
                  onClick={() => handleNoteSelect(note._id)}
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="truncate">{note.title || 'Untitled'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-2">
              No notes yet - Click + to create one
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      {activeNoteId ? (
        <div className="flex-1 overflow-hidden border-l">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none outline-none w-full"
                placeholder="Untitled"
              />
              <Button onClick={handleSaveNote} size="sm" className="gap-1">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
            <div className="flex-1 p-4">
              <NoteEditor
                title={title}
                content={content}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onSaveNote={handleSaveNote}
                noteId={activeNoteId}
                workspaceId={workspaceId}
                channelId={channelId}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a note or create a new one</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a note from the sidebar or create a new one to get started
            </p>
            <Button onClick={handleCreateNote} className="gap-2">
              <Plus className="h-4 w-4" />
              Create a new note
            </Button>
          </div>
        </div>
      )}

      <FolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onSubmit={handleCreateFolder}
        title="Create Folder"
        description="Enter a name for your new folder"
      />
    </div>
  );
};

export default NotesPage;
