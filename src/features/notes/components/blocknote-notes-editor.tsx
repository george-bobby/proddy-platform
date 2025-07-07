'use client';

import { Note } from '../types';
import { Id } from '@/../convex/_generated/dataModel';
import { BlockNoteEditor } from './blocknote-editor';

interface BlockNoteNotesEditorProps {
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

export const BlockNoteNotesEditor = ({
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
}: BlockNoteNotesEditorProps) => {
  return (
    <div className="flex flex-col h-full relative">
      {/* Note Content */}
      <div className="flex-1 overflow-hidden">
        <BlockNoteEditor
          noteId={note._id}
          className="h-full"
        />
      </div>
    </div>
  );
};
