'use client';

import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { FilePlus, ImageIcon, Loader, Save, Trash2, X, Users } from 'lucide-react';
import { NotesParticipants } from './notes-participants';
import { toast } from 'sonner';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import { Id } from '@/../convex/_generated/dataModel';
import { NoteTitle } from './note-title';
import { NotePage } from './note-page';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMyPresence, useUpdateMyPresence } from '@/../liveblocks.config';
import { LiveCursorsPresence, LiveParticipants } from '@/features/live';

interface Page {
  id: string;
  content: string;
}

interface NoteEditorProps {
  title: string;
  content: string; // This will now be used as the first page content
  onTitleChange: (title: string) => void;
  onContentChange: (content: string, pageIndex?: number) => void;
  onSaveNote?: () => void;
  onImageUpload?: (storageId: Id<'_storage'>) => void;
  isLoading?: boolean;
  noteId?: Id<'notes'>;
  workspaceId?: Id<'workspaces'>;
  channelId?: Id<'channels'>;
}

export const NoteEditor = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSaveNote,
  onImageUpload,
  isLoading = false,
  noteId,
  workspaceId,
  channelId,
}: NoteEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  // Use Liveblocks presence to track user activity in the note
  const [myPresence, updateMyPresence] = useMyPresence();

  // Handle mouse movement for live cursors
  const handleMouseMove = (e: React.MouseEvent) => {
    updateMyPresence({
      cursor: { x: e.clientX, y: e.clientY },
      lastActivity: Date.now()
    });
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    updateMyPresence({
      cursor: null,
      lastActivity: Date.now()
    });
  };

  // Handle editing state changes
  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    updateMyPresence({
      isEditing: editing,
      lastActivity: Date.now()
    });
  };

  // Initialize single page with the content
  useEffect(() => {
    // Create a default empty page
    const defaultPage = {
      id: `page-${Date.now()}`,
      content: JSON.stringify({ ops: [{ insert: '\n' }] })
    };

    if (!content) {
      // If no content, create an empty page
      setPages([defaultPage]);
      console.log('NoteEditor: No content provided, using default empty page');
      return;
    }

    try {
      console.log('NoteEditor: Setting page with content:', content);

      // Create a single page with the content
      setPages([
        {
          id: `page-${Date.now()}`,
          content: content
        }
      ]);
    } catch (error) {
      console.error('Failed to parse content in NoteEditor:', error);
      // If parsing fails, create a new page with default content
      setPages([defaultPage]);
    }
  }, [content, noteId]); // Also re-initialize when noteId changes

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      const url = await generateUploadUrl(
        {},
        {
          throwError: true,
        }
      );

      if (!url) throw new Error('URL not found.');

      const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-type': file.type },
        body: file,
      });

      if (!result.ok) throw new Error('Failed to upload image.');

      const { storageId } = await result.json();

      // We'll just notify the parent component about the uploaded image
      // since we don't have direct access to the Quill editor anymore

      // Notify parent component about the uploaded image
      if (onImageUpload) {
        onImageUpload(storageId);
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  // Trigger file input click
  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  // Handle page content change with direct approach
  const handlePageContentChange = (newContent: string, isEnterKeyPress?: boolean) => {
    // Set editing state
    setIsEditing(true);

    // Update the page content directly
    try {
      // Update local state
      setPages(prevPages => {
        if (prevPages.length > 0) {
          return [
            {
              ...prevPages[0],
              content: newContent
            }
          ];
        }
        return prevPages;
      });

      // Notify parent component about the content change
      onContentChange(newContent);
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  // Page management functions removed

  // Handle saving the note with simplified approach
  const handleSaveNote = () => {
    // Make sure we're saving the latest state
    if (pages.length > 0) {
      // Get the content of the first page
      const pageContent = pages[0].content;

      // Update content with the page content
      onContentChange(pageContent);

      // Call the explicit save function if provided
      if (onSaveNote) {
        onSaveNote();
      }

      // Update last saved time
      setLastSaved(new Date());

      // Reset editing state
      setIsEditing(false);

      // Show success message
      toast.success('Note saved');
    } else {
      toast.error('Cannot save empty note');
    }
  };

  // Format the last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return 'Not saved yet';

    // If saved less than a minute ago
    const diffInSeconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `Saved ${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }

    // If saved less than an hour ago
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Saved ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    // If saved today
    const hours = lastSaved.getHours().toString().padStart(2, '0');
    const minutes = lastSaved.getMinutes().toString().padStart(2, '0');
    return `Saved at ${hours}:${minutes}`;
  };

  // Handle storage ID from child components
  const handleStorageIdReceived = (storageId: Id<'_storage'>) => {
    if (onImageUpload) {
      onImageUpload(storageId);
    }
  };

  // Set mounted state - simplified without presence updates
  useEffect(() => {
    setIsMounted(true);

    // No presence updates for now to focus on basic typing functionality
  }, []);

  // Update the last saved text every minute
  useEffect(() => {
    if (!lastSaved) return;

    // Update the last saved text every minute to keep it current
    const intervalId = setInterval(() => {
      // Force a re-render to update the last saved text
      setLastSaved(prev => prev ? new Date(prev.getTime()) : null);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [lastSaved]);

  if (!isMounted) {
    return null;
  }

  // Pointer event handlers for live cursors
  const handlePointerMove = (e: React.PointerEvent) => {
    handleMouseMove(e as any);
  };

  // Pointer leave handler for live cursors
  const handlePointerLeave = () => {
    handleMouseLeave();
  };

  return (
    <div
      className="flex flex-col h-full relative"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <NoteTitle title={title} onChange={onTitleChange} autoFocus={!title} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 border rounded-md px-3 py-1" style={{ minWidth: '180px' }}>
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {getLastSavedText()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveNote}
                  className="gap-1 ml-2 whitespace-nowrap"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>

              {/* Activity status component positioned next to Save button */}
              {noteId && (
                <div className="border rounded-md px-2 py-1" style={{ minWidth: '150px' }}>
                  <LiveParticipants variant="notes" className="h-7" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page navigation removed */}

      <div className="flex-1 overflow-y-auto">
        <div className={cn("p-6", isLoading && "opacity-50 pointer-events-none")}>
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileInputChange}
          />

          {/* Render single page */}
          {pages.length > 0 && (
            <NotePage
              key={pages[0].id}
              content={pages[0].content}
              onContentChange={(content, isEnterKeyPress) => handlePageContentChange(content, isEnterKeyPress)}
              onImageUpload={handleStorageIdReceived}
              isActive={true}
              pageIndex={0}
            />
          )}
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Live Cursors Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <LiveCursorsPresence variant="notes" showDrawingPaths={false} />
        </svg>
      </div>
    </div>
  );
};
