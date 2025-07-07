'use client';

import { useRef } from 'react';
import { Note } from '../types';
import { Id } from '@/../convex/_generated/dataModel';
import { NotePage } from './note-page';
import { NotesToolbar } from './notes-toolbar';

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
  const quillRef = useRef<any>(null);

  return (
    <div className="flex flex-col h-full relative">
      {/* Notes Toolbar - hidden in fullscreen */}
      {!isFullScreen && (
        <NotesToolbar quillRef={quillRef} />
      )}

      {/* Note Content */}
      <div className="flex-1 overflow-hidden">
        <NotePage
          content={note.content}
          onContentChange={onContentChange}
          isActive={true}
          pageIndex={0}
          quillRef={quillRef}
        />
      </div>
    </div>
  );
};
