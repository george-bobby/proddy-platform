'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { EnhancedNotesSidebar } from '@/features/notes/components/enhanced-notes-sidebar';
import { EnhancedNotesHeader } from '@/features/notes/components/enhanced-notes-header';
import { EnhancedNotesEditor } from '@/features/notes/components/enhanced-notes-editor';
import { NotesRoom } from '@/features/notes/components/notes-room';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Note } from '@/features/notes/types';

const NotesPage = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as Id<"workspaces">;
  const channelId = params.channelId as Id<"channels">;

  // State
  const [activeNoteId, setActiveNoteId] = useState<Id<"notes"> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Get channel information for the title
  const channel = useQuery(api.channels.getById, { id: channelId });

  // Set document title based on channel name
  useDocumentTitle(channel ? `Notes - ${channel.name}` : "Notes");

  // Convex queries
  const notes = useQuery(api.notes.list, { workspaceId, channelId }) || [];
  const folders = useQuery(api.noteFolders.list, { workspaceId, channelId }) || [];

  // Get active note
  const activeNote = useQuery(
    api.notes.get,
    activeNoteId ? { id: activeNoteId } : "skip"
  );

  // Convex mutations
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const createFolder = useMutation(api.noteFolders.create);

  // Handle note selection
  const handleNoteSelect = (noteId: string) => {
    setActiveNoteId(noteId as Id<"notes">);
  };

  // Handle note creation
  const handleCreateNote = async (folderId?: Id<"noteFolders">) => {
    try {
      const defaultTitle = "Untitled";
      const defaultContent = JSON.stringify({ ops: [{ insert: "\n" }] });

      // Create the note in Convex
      const noteId = await createNote({
        title: defaultTitle,
        content: defaultContent,
        workspaceId,
        channelId,
        folderId,
        tags: [], // Initialize with empty tags
      });

      if (noteId) {
        setActiveNoteId(noteId);
        toast.success("Note created");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note");
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    try {
      const folderName = "New Category";

      await createFolder({
        name: folderName,
        workspaceId,
        channelId,
      });

      toast.success(`Category "${folderName}" created`);
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    }
  };

  // Handle note updates
  const handleNoteUpdate = async (updates: Partial<Note>) => {
    if (!activeNoteId) return;

    try {
      await updateNote({
        id: activeNoteId,
        ...updates,
      });
      setIsEditing(false);
      toast.success("Note updated");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleTitleChange = (title: string) => {
    handleNoteUpdate({ title });
  };

  const handleContentChange = (content: string) => {
    handleNoteUpdate({ content });
  };

  // Show empty state if no notes and no folders
  if (notes.length === 0 && folders.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No notes yet</h3>
          <p className="text-sm mb-4">Create your first note to get started</p>
          <Button onClick={() => handleCreateNote()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
      </div>
    );
  }

  // Wrap the entire notes UI in NotesRoom for Liveblocks presence
  return (
    <NotesRoom noteId={activeNote?._id || channelId}>
      <div className="flex h-full flex-col">
        {/* Enhanced Header with collaborators and search */}
        <EnhancedNotesHeader
          selectedNote={activeNote}
          onCreateNote={() => handleCreateNote()}
          workspaceId={workspaceId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Sidebar with categories */}
          <EnhancedNotesSidebar
            workspaceId={workspaceId}
            channelId={channelId}
            selectedNoteId={activeNoteId}
            onNoteSelect={handleNoteSelect}
            collapsed={sidebarCollapsed}
            onCreateNote={handleCreateNote}
            onCreateFolder={handleCreateFolder}
          />
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeNote ? (
              <EnhancedNotesEditor
                note={activeNote}
                onUpdate={handleNoteUpdate}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onSaveNote={() => { }}
                isLoading={isEditing}
                workspaceId={workspaceId}
                channelId={channelId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No note selected</h3>
                  <p className="text-sm mb-4">Select a note from the sidebar or create a new one</p>
                  <Button onClick={() => handleCreateNote()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </NotesRoom>
  );
};

export default NotesPage;
