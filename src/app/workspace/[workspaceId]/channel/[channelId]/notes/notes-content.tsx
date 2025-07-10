'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { FileText, Plus } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { BlockNoteNotesEditor, ExportNoteDialog, useLiveNoteSession } from '@/features/notes';
import { LiveSidebar, LiveParticipants, LiveHeader } from '@/features/live';
import { StreamAudioRoom } from '@/features/audio';
import { useNoteContent } from '@/hooks/use-note-content';
import { Note } from '@/features/notes/types';

// Component that contains the notes content and live session logic
// This needs to be inside the LiveblocksRoom to access RoomProvider
interface NotesContentProps {
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
  activeNoteId: Id<'notes'> | null;
  activeNote: any;
  notes: any[];
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
  showExportDialog: boolean;
  setShowExportDialog: (value: boolean) => void;
  pageContainerRef: React.RefObject<HTMLDivElement>;
  onNoteSelect: (noteId: Id<'notes'>) => void;
  onCreateNote: () => Promise<void>;
  onDeleteNote: (noteId: Id<'notes'>) => Promise<void>;
  onUpdateNote: (noteId: Id<'notes'>, updates: any) => Promise<void>;
}

export const NotesContent = ({
  workspaceId,
  channelId,
  activeNoteId,
  activeNote,
  notes,
  isFullScreen,
  setIsFullScreen,
  showExportDialog,
  setShowExportDialog,
  pageContainerRef,
  onNoteSelect,
  onCreateNote,
  onDeleteNote,
  onUpdateNote
}: NotesContentProps) => {
  // Live note session hook - now inside RoomProvider context
  // We need to call hooks unconditionally, so we'll pass a dummy noteId when none is active
  const liveSession = useLiveNoteSession({
    noteId: activeNoteId || ('dummy-note-id' as Id<'notes'>),
    noteTitle: activeNote?.title || 'Untitled',
    workspaceId,
    channelId,
    autoAnnounce: !!activeNoteId, // Only auto-announce when there's an active note
  });

  // Note content management
  const { content, setContent, hasUnsavedChanges } = useNoteContent(
    activeNote?.content || ''
  );

  // Handle note updates
  const handleNoteUpdate = async (updates: Partial<Note>) => {
    if (!activeNoteId) return;

    try {
      await onUpdateNote(activeNoteId, updates);
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  };

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, [setContent]);

  // Auto-save content changes
  useEffect(() => {
    if (!activeNoteId || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      handleNoteUpdate({ content });
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [content, hasUnsavedChanges, activeNoteId, handleNoteUpdate]);

  // Handle title changes
  const handleTitleChange = useCallback(async (newTitle: string) => {
    if (!activeNoteId) return;
    await handleNoteUpdate({ title: newTitle });
  }, [activeNoteId, handleNoteUpdate]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!activeNoteId) return;
    await handleNoteUpdate({ content });
  }, [activeNoteId, content, handleNoteUpdate]);

  return (
    <div ref={pageContainerRef} className={`flex h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : 'flex-col'}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar with categories - hidden in fullscreen */}
        {!isFullScreen && (
          <LiveSidebar
            type="notes"
            items={notes.map(note => ({
              _id: note._id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              createdAt: note.createdAt,
              updatedAt: note.updatedAt
            }))}
            selectedItemId={activeNoteId}
            onItemSelect={onNoteSelect}
            onCreateItem={onCreateNote}
            onDeleteItem={onDeleteNote}
            workspaceId={workspaceId}
            channelId={channelId}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Live Header - always visible */}
          <LiveHeader
            type="notes"
            title={activeNote?.title || 'Untitled Note'}
            onTitleChange={handleTitleChange}
            onSave={handleSave}
            hasUnsavedChanges={hasUnsavedChanges}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            onExport={() => setShowExportDialog(true)}
            tags={activeNote?.tags || []}
            onTagsChange={(tags) => handleNoteUpdate({ tags })}
            workspaceId={workspaceId}
            channelId={channelId}
            createdAt={activeNote?.createdAt}
            updatedAt={activeNote?.updatedAt}
          />

          {/* Notes Editor */}
          <div className="flex-1 overflow-hidden">
            {activeNote ? (
              <BlockNoteNotesEditor
                noteId={activeNote._id}
                initialContent={content}
                onChange={handleContentChange}
                workspaceId={workspaceId}
                channelId={channelId}
                isFullScreen={isFullScreen}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                  <div className="text-lg font-medium mb-2">No note selected</div>
                  <div className="text-sm mb-4">Select a note from the sidebar or create a new one</div>
                  <Button onClick={onCreateNote} className="gap-2">
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
