'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { NotesSidebar } from '@/features/notes/components/notes-sidebar';
import { NotesHeader } from '@/features/notes/components/notes-header';
import { NotesEditor } from '@/features/notes/components/notes-editor';
import { LiveblocksRoom } from '@/features/live';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useNoteContent } from '@/hooks/use-note-content';
import { Note } from '@/features/notes/types';

const NotesPage = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as Id<"workspaces">;
  const channelId = params.channelId as Id<"channels">;

  // State
  const [activeNoteId, setActiveNoteId] = useState<Id<"notes"> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Ref for fullscreen container
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Get channel information for the title
  const channel = useQuery(api.channels.getById, { id: channelId });

  // Set document title based on channel name
  useDocumentTitle(channel ? `Notes - ${channel.name}` : "Notes");

  // Convex queries
  const notes = useQuery(api.notes.list, { workspaceId, channelId }) || [];

  // Get active note
  const activeNote = useQuery(
    api.notes.get,
    activeNoteId ? { id: activeNoteId } : "skip"
  );

  // Convex mutations
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);

  // Handle note updates
  const handleNoteUpdate = async (updates: Partial<Note>) => {
    if (!activeNoteId) return;

    try {
      await updateNote({
        id: activeNoteId,
        ...updates,
      });
      // Removed toast notification for better UX
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    }
  };

  // Use the note content hook for better conflict resolution
  const {
    localContent,
    localTitle,
    isTyping,
    handleContentChange,
    handleTitleChange,
    hasUnsavedChanges,
  } = useNoteContent({
    note: activeNote,
    onUpdate: handleNoteUpdate,
    debounceMs: 1000,
  });

  // Handle note selection
  const handleNoteSelect = (noteId: string) => {
    setActiveNoteId(noteId as Id<"notes">);
  };

  // Function to toggle full screen
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter full screen - use the page container element
      if (pageContainerRef?.current) {
        pageContainerRef.current.requestFullscreen().then(() => {
          setIsFullScreen(true);
        }).catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    } else {
      // Exit full screen
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit full-screen mode: ${err.message}`);
        });
      }
    }
  }, [pageContainerRef]);

  // Effect to handle full screen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      // Check if our page container is the fullscreen element
      const isPageFullScreen = document.fullscreenElement === pageContainerRef?.current;
      setIsFullScreen(isPageFullScreen);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [pageContainerRef]);

  // Handle note creation
  const handleCreateNote = async () => {
    try {
      const defaultTitle = "Untitled";
      const defaultContent = JSON.stringify({ ops: [{ insert: "\n" }] });

      // Create the note in Convex
      const noteId = await createNote({
        title: defaultTitle,
        content: defaultContent,
        workspaceId,
        channelId,
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

  // Show empty state if no notes and no folders
  if (notes.length === 0) {
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

  // Wrap the entire notes UI in LiveblocksRoom for Liveblocks presence
  return (
    <LiveblocksRoom roomId={`note-${activeNote?._id || channelId}`} roomType="note">
      <div ref={pageContainerRef} className={`flex h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : 'flex-col'}`}>
        {/* Enhanced Header with collaborators and search - hidden in fullscreen */}
        {!isFullScreen && (
          <NotesHeader
            selectedNote={activeNote}
            onCreateNote={() => handleCreateNote()}
            workspaceId={workspaceId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Sidebar with categories - hidden in fullscreen */}
          {!isFullScreen && (
            <NotesSidebar
              workspaceId={workspaceId}
              channelId={channelId}
              selectedNoteId={activeNoteId}
              onNoteSelect={handleNoteSelect}
              collapsed={sidebarCollapsed}
              onCreateNote={handleCreateNote}
            />
          )}
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeNote ? (
              <NotesEditor
                note={{
                  ...activeNote,
                  title: isTyping ? localTitle : activeNote.title,
                  content: isTyping ? localContent : activeNote.content,
                }}
                onUpdate={handleNoteUpdate}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onSaveNote={() => { }}
                isLoading={isTyping || hasUnsavedChanges}
                workspaceId={workspaceId}
                channelId={channelId}
                toggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
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
    </LiveblocksRoom>
  );
};

export default NotesPage;
