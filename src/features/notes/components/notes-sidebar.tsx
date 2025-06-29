'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Folder, FileText, Users, Lock, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Note } from '../types';
import { Id } from '@/../convex/_generated/dataModel';
import { useGetNotes } from '../api/use-get-notes';
import { useRoom, useOthers } from '@/../liveblocks.config';

import { useDeleteNote } from '../api/use-delete-note';
import { toast } from 'sonner';

interface NotesSidebarProps {
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  collapsed: boolean;
  onCreateNote: () => void;
}

export const NotesSidebar = ({
  workspaceId,
  channelId,
  selectedNoteId,
  onNoteSelect,
  collapsed,
  onCreateNote,
}: NotesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: notes = [] } = useGetNotes(workspaceId, channelId);
  const others = useOthers();
  const { mutate: deleteNote } = useDeleteNote();
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    return notes.filter((note: Note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags && note.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    });
  }, [notes, searchQuery]);

  const getPreviewText = (content: string) => {
    try {
      const delta = JSON.parse(content);
      if (delta.ops) {
        return delta.ops
          .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
          .join('')
          .replace(/\n/g, ' ')
          .trim()
          .substring(0, 100);
      }
    } catch {
      // Fallback for non-Quill content
      return content.substring(0, 100);
    }
    return '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Helper for delete with confirmation
  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
      toast.success('Note deleted');
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 border-r bg-muted/30 flex flex-col items-center py-4 gap-2">
        <Button variant="ghost" size="sm" onClick={() => onCreateNote()}>
          <Plus className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap mt-8">
          Notes
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">

      {/* Search and Create */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => onCreateNote()} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No notes match your search' : 'No notes yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map((note: Note) => (
                <div
                  key={note._id}
                  className="relative group"
                  onMouseEnter={() => setHoveredNoteId(note._id)}
                  onMouseLeave={() => setHoveredNoteId(null)}
                >
                  <button
                    onClick={() => onNoteSelect(note._id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-colors",
                      selectedNoteId === note._id
                        ? "bg-primary/10 border-primary/20"
                        : "bg-background hover:bg-muted/50 border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {note.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    {/* Note preview */}
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {getPreviewText(note.content)}
                    </div>
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.slice(0, 2).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-1 py-0 h-4"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                  {hoveredNoteId === note._id && (
                    <button
                      className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-red-600 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note._id);
                      }}
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
