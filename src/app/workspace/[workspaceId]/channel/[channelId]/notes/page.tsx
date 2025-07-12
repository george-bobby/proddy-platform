'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { LiveblocksRoom, LiveSidebar, LiveHeader } from '@/features/live';
import { BlockNoteNotesEditor, ExportNoteDialog, useLiveNoteSession } from '@/features/notes';
import { StreamAudioRoom } from '@/features/audio';
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
  const [showExportDialog, setShowExportDialog] = useState(false);

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
  const deleteNote = useMutation(api.notes.remove);

  // Handle note updates
  const handleNoteUpdate = async (noteId: Id<'notes'>, updates: Partial<Note>) => {
    try {
      await updateNote({
        id: noteId,
        ...updates,
      });
      // Removed toast notification for better UX
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    }
  };

  // Create a wrapper function that matches the hook's expected signature
  const handleUpdate = useCallback(async (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    await handleNoteUpdate(activeNoteId, updates);
  }, [activeNoteId, handleNoteUpdate]);

  // Note content management
  const { localContent, localTitle, isTyping, handleContentChange: handleNoteContentChange, handleTitleChange: handleNoteTitleChange, hasUnsavedChanges } = useNoteContent({
    note: activeNote || undefined,
    onUpdate: handleUpdate,
    debounceMs: 1000,
  });

  // Handle save
  const handleSave = useCallback(async () => {
    if (!activeNoteId) return;
    try {
      await handleUpdate({ content: localContent });
      toast.success('Note saved successfully');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    }
  }, [activeNoteId, localContent, handleUpdate]);

  // Handle note selection
  const handleNoteSelect = useCallback((noteId: Id<'notes'>) => {
    setActiveNoteId(noteId);
  }, []);

  // Create wrapper for onItemSelect to match LiveSidebar's expected signature
  const handleItemSelect = useCallback((itemId: string) => {
    handleNoteSelect(itemId as Id<'notes'>);
  }, [handleNoteSelect]);

  // Handle note creation
  const handleCreateNote = async () => {
    try {
      const defaultTitle = "Untitled Note";
      const defaultContent = ""; // Empty content for BlockNote

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

  // Handle note deletion
  const handleDeleteNote = async (noteId: Id<'notes'>) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote({ id: noteId });
        toast.success('Note deleted successfully');
        // If the deleted note was active, clear the selection
        if (activeNoteId === noteId) {
          setActiveNoteId(null);
        }
      } catch (error) {
        toast.error('Failed to delete note');
        console.error('Error deleting note:', error);
      }
    }
  };

  // Create wrapper for onDeleteItem to match LiveSidebar's expected signature
  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      await handleDeleteNote(itemId as Id<'notes'>);
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  }, [handleDeleteNote]);

  // Create wrapper for onRenameItem to match LiveSidebar's expected signature
  const handleRenameItem = useCallback(async (itemId: string, newName: string) => {
    try {
      await handleNoteUpdate(itemId as Id<'notes'>, { title: newName });
    } catch (error) {
      console.error('Failed to rename note:', error);
      toast.error('Failed to rename note');
    }
  }, [handleNoteUpdate]);

  // Memoize the note object to prevent unnecessary re-renders
  const memoizedNote = useMemo(() => {
    if (!activeNote) return null;
    return {
      ...activeNote,
      title: isTyping ? localTitle : activeNote.title,
      content: isTyping ? localContent : activeNote.content
    };
  }, [activeNote, isTyping, localTitle, localContent]);

  // Memoize the update callback to prevent re-renders
  const memoizedOnUpdate = useCallback((updates: Partial<Note>) => {
    handleUpdate(updates).catch((error) => {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    });
  }, [handleUpdate]);

  // Memoize the fullscreen toggle to prevent re-renders
  const memoizedToggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen, setIsFullScreen]);

  // Memoize the export callback
  const memoizedOnExport = useCallback(() => {
    setShowExportDialog(true);
  }, [setShowExportDialog]);

  // Memoize the tags change callback
  const memoizedOnTagsChange = useCallback((tags: string[]) => {
    handleUpdate({ tags }).catch((error) => {
      console.error('Failed to update tags:', error);
      toast.error('Failed to update tags');
    });
  }, [handleUpdate]);

  // Memoize the items array to prevent unnecessary re-renders of LiveSidebar
  const memoizedItems = useMemo(() => {
    return notes.map(note => ({
      _id: note._id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));
  }, [notes]);

  // Memoize the sidebar toggle callback
  const memoizedToggleCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);
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
      <NotesContent
        workspaceId={workspaceId}
        channelId={channelId}
        activeNoteId={activeNoteId}
        activeNote={activeNote}
        notes={notes}
        sidebarCollapsed={sidebarCollapsed}
        isFullScreen={isFullScreen}
        showExportDialog={showExportDialog}
        pageContainerRef={pageContainerRef}
        localContent={localContent}
        localTitle={localTitle}
        isTyping={isTyping}
        hasUnsavedChanges={hasUnsavedChanges}
        memoizedNote={memoizedNote}
        memoizedItems={memoizedItems}
        handleNoteSelect={handleNoteSelect}
        handleItemSelect={handleItemSelect}
        handleCreateNote={handleCreateNote}
        handleDeleteItem={handleDeleteItem}
        handleRenameItem={handleRenameItem}
        handleNoteTitleChange={handleNoteTitleChange}
        handleNoteContentChange={handleNoteContentChange}
        handleSave={handleSave}
        memoizedOnUpdate={memoizedOnUpdate}
        memoizedToggleFullScreen={memoizedToggleFullScreen}
        memoizedOnExport={memoizedOnExport}
        memoizedOnTagsChange={memoizedOnTagsChange}
        memoizedToggleCollapse={memoizedToggleCollapse}
        setShowExportDialog={setShowExportDialog}
      />
    </LiveblocksRoom>
  );
};

// New component that contains the live session logic and UI
const NotesContent = ({
  workspaceId,
  channelId,
  activeNoteId,
  activeNote,
  notes,
  sidebarCollapsed,
  isFullScreen,
  showExportDialog,
  pageContainerRef,
  localContent,
  localTitle,
  isTyping,
  hasUnsavedChanges,
  memoizedNote,
  memoizedItems,
  handleNoteSelect,
  handleItemSelect,
  handleCreateNote,
  handleDeleteItem,
  handleRenameItem,
  handleNoteTitleChange,
  handleNoteContentChange,
  handleSave,
  memoizedOnUpdate,
  memoizedToggleFullScreen,
  memoizedOnExport,
  memoizedOnTagsChange,
  memoizedToggleCollapse,
  setShowExportDialog,
}: {
  workspaceId: Id<"workspaces">;
  channelId: Id<"channels">;
  activeNoteId: Id<"notes"> | null;
  activeNote: any;
  notes: any[];
  sidebarCollapsed: boolean;
  isFullScreen: boolean;
  showExportDialog: boolean;
  pageContainerRef: React.RefObject<HTMLDivElement>;
  localContent: string;
  localTitle: string;
  isTyping: boolean;
  hasUnsavedChanges: boolean;
  memoizedNote: any;
  memoizedItems: any[];
  handleNoteSelect: (noteId: Id<'notes'>) => void;
  handleItemSelect: (itemId: string) => void;
  handleCreateNote: () => Promise<void>;
  handleDeleteItem: (itemId: string) => Promise<void>;
  handleRenameItem: (itemId: string, newName: string) => Promise<void>;
  handleNoteTitleChange: (title: string) => void;
  handleNoteContentChange: (content: string) => void;
  handleSave: () => Promise<void>;
  memoizedOnUpdate: (updates: Partial<Note>) => void;
  memoizedToggleFullScreen: () => void;
  memoizedOnExport: () => void;
  memoizedOnTagsChange: (tags: string[]) => void;
  memoizedToggleCollapse: () => void;
  setShowExportDialog: (show: boolean) => void;
}) => {
  // Live note session hook - now inside RoomProvider context
  // Use a stable dummy ID that exists in the database to avoid server errors
  const dummyNoteId = 'kn7cvx952gp794j4vzvxxqqgk57k9yhh' as Id<'notes'>;
  const liveSession = useLiveNoteSession({
    noteId: activeNoteId || dummyNoteId,
    noteTitle: activeNote?.title || 'Untitled',
    workspaceId,
    channelId,
    autoAnnounce: !!activeNoteId, // Only auto-announce when there's an active note
  });

  return (
    <div ref={pageContainerRef} className={`flex h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : 'flex-col'}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar with categories - hidden in fullscreen */}
        {!isFullScreen && (
          <LiveSidebar
            type="notes"
            items={memoizedItems}
            selectedItemId={activeNoteId}
            onItemSelect={handleItemSelect}
            collapsed={sidebarCollapsed}
            onToggleCollapse={memoizedToggleCollapse}
            onCreateItem={handleCreateNote}
            onDeleteItem={handleDeleteItem}
            onRenameItem={handleRenameItem}
            workspaceId={workspaceId}
            channelId={channelId}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Live Header - always visible */}
          <LiveHeader
            type="notes"
            title={isTyping ? localTitle : (activeNote?.title || 'Untitled Note')}
            onTitleChange={handleNoteTitleChange}
            onSave={handleSave}
            hasUnsavedChanges={hasUnsavedChanges}
            isFullScreen={isFullScreen}
            toggleFullScreen={memoizedToggleFullScreen}
            onExport={memoizedOnExport}
            tags={activeNote?.tags || []}
            onTagsChange={memoizedOnTagsChange}
            createdAt={activeNote?.createdAt}
            updatedAt={activeNote?.updatedAt}
            showTags={true}
            showFullScreenToggle={true}
          />

          {/* Notes Editor */}
          <div className="flex-1 overflow-hidden">
            {memoizedNote && activeNoteId ? (
              <BlockNoteNotesEditor
                note={memoizedNote}
                onUpdate={memoizedOnUpdate}
                onTitleChange={handleNoteTitleChange}
                onContentChange={handleNoteContentChange}
                onSaveNote={handleSave}
                isLoading={isTyping || hasUnsavedChanges}
                workspaceId={workspaceId}
                channelId={channelId}
                toggleFullScreen={memoizedToggleFullScreen}
                isFullScreen={isFullScreen}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                  <div className="text-lg font-medium mb-2">No note selected</div>
                  <div className="text-sm mb-4">Select a note from the sidebar or create a new one</div>
                  <Button
                    onClick={() => {
                      handleCreateNote().catch((error) => {
                        console.error('Failed to create note:', error);
                        toast.error('Failed to create note');
                      });
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Note
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Room Component */}
      {activeNote && (
        <StreamAudioRoom
          roomId={activeNote._id}
          workspaceId={workspaceId}
          channelId={channelId}
          canvasName={activeNote.title || 'Notes Audio Room'}
          isFullScreen={isFullScreen}
        />
      )}

      {/* Export Dialog */}
      {activeNote && (
        <ExportNoteDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          note={activeNote}
        />
      )}
    </div>
  );
};

export default NotesPage;
