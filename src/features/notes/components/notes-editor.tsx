'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink, Users, Maximize, Minimize } from 'lucide-react';
import { LiveParticipants } from '@/features/live/components/live-participants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TagInput } from './tag-input';
import { Note } from '../types';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { NotePage } from './note-page';

interface NotesEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSaveNote: () => void;
  isLoading?: boolean;
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
  toggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

export const NotesEditor = ({
  note,
  onUpdate,
  onTitleChange,
  onContentChange,
  onSaveNote,
  isLoading = false,
  workspaceId,
  channelId,
  toggleFullScreen,
  isFullScreen = false,
}: NotesEditorProps) => {
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTitle(note.title);
    setTags(note.tags || []);
    setIsEditing(false);
  }, [note._id, note.title, note.tags]);

  const handleSave = () => {
    onUpdate({
      title,
      tags,
      updatedAt: Date.now()
    });
    setIsEditing(false);
  };

  const handleTitleChangeLocal = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(newTitle);
    setIsEditing(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    onUpdate({ tags: newTags });
    setIsEditing(true);
  };

  const handleCanvasClick = () => {
    router.push(`/workspace/${workspaceId}/channel/${channelId}/canvas`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if content contains brainstorming keywords to show canvas link
  const shouldShowCanvasLink = () => {
    const content = note.content.toLowerCase();
    return content.includes('brainstorm') ||
      content.includes('canvas') ||
      content.includes('diagram') ||
      content.includes('visual') ||
      tags.some(tag => ['brainstorm', 'canvas', 'visual', 'diagram'].includes(tag.toLowerCase()));
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Live Participants - positioned like canvas participants */}
      <LiveParticipants
        variant="notes"
        isFullScreen={isFullScreen}
        className={`absolute ${isFullScreen ? 'top-8' : 'top-32'} right-8 z-50`}
      />

      {/* Fullscreen Button - positioned in top center like canvas TopToolbar */}
      {toggleFullScreen && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white rounded-md p-1.5 shadow-md">
            <Button
              onClick={toggleFullScreen}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Editor Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <Input
            value={title}
            onChange={(e) => handleTitleChangeLocal(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
            placeholder="Note title..."
          />

          {isEditing && (
            <Button onClick={handleSave} size="sm" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div>Created {formatDate(note.createdAt)}</div>
          <span>•</span>
          <div>Updated {formatDate(note.updatedAt)}</div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tags:</span>
          <TagInput
            tags={tags}
            onTagsChange={handleTagsChange}
            placeholder="Add tags..."
            className="flex-1"
          />
        </div>

        {/* Canvas Link Card - Show if content suggests brainstorming */}
        {shouldShowCanvasLink() && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    Visual Brainstorming
                  </div>
                  <div className="text-xs text-blue-700">
                    Continue this discussion on the canvas
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCanvasClick}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Canvas
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Note Content */}
      <div className="flex-1 overflow-hidden">
        <NotePage
          content={note.content}
          onContentChange={onContentChange}
          isActive={true}
          pageIndex={0}
        />
      </div>
    </div>
  );
};
