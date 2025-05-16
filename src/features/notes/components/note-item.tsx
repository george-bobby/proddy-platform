'use client';

import { format } from 'date-fns';
import { FileText, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Note } from '../types';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export const NoteItem = ({ note, isActive, onClick, onDelete }: NoteItemProps) => {
  // Extract plain text from the note content (which is a JSON stringified Quill Delta)
  const getPlainText = () => {
    try {
      const content = JSON.parse(note.content);
      if (content.ops) {
        return content.ops
          .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
          .join('')
          .trim()
          .substring(0, 50);
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const plainTextPreview = getPlainText();
  const lastUpdated = format(new Date(note.updatedAt), 'MMM d, yyyy');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(note._id, e);
    }
  };

  return (
    <div
      className={cn(
        'p-3 rounded-md cursor-pointer transition-colors mb-1 group',
        isActive
          ? 'bg-primary/10 hover:bg-primary/15'
          : 'hover:bg-gray-100'
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex-1 overflow-hidden"
          onClick={onClick}
        >
          <div className="flex items-center gap-2 mb-1">
            {note.icon ? (
              <div className="text-lg">{note.icon}</div>
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
            <h3 className="font-medium truncate">{note.title || 'Untitled'}</h3>
          </div>
          {plainTextPreview && (
            <p className="text-sm text-muted-foreground truncate">{plainTextPreview}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{lastUpdated}</p>
        </div>

        {onDelete && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete note</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};
