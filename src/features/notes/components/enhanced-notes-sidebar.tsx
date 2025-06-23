'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Folder, FileText, Users, Lock, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Note, NoteFolder } from '../types';
import { Id } from '@/../convex/_generated/dataModel';
import { useGetNotes } from '../api/use-get-notes';
import { useGetNoteFolders } from '../api/use-note-folders';
import { useRoom, useOthers } from '@/../liveblocks.config';
import { useDeleteNote } from '../api/use-delete-note';
import { toast } from 'sonner';

interface EnhancedNotesSidebarProps {
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  collapsed: boolean;
  onCreateNote: (folderId?: Id<'noteFolders'>) => void;
  onCreateFolder: () => void;
}

export const EnhancedNotesSidebar = ({
  workspaceId,
  channelId,
  selectedNoteId,
  onNoteSelect,
  collapsed,
  onCreateNote,
  onCreateFolder,
}: EnhancedNotesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: notes = [] } = useGetNotes(workspaceId, channelId);
  const { data: folders = [] } = useGetNoteFolders(workspaceId, channelId);
  const others = useOthers();
  const { mutate: deleteNote } = useDeleteNote();
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  // Group notes by folder
  const notesByFolder = useMemo(() => {
    const filteredNotes = notes.filter((note: Note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags && note.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    });
    const byFolder: Record<string, Note[]> = {};
    folders.forEach((folder: NoteFolder) => {
      byFolder[folder._id] = [];
    });
    byFolder['General'] = [];
    filteredNotes.forEach((note: Note) => {
      if (note.folderId && byFolder[note.folderId]) {
        byFolder[note.folderId].push(note);
      } else {
        byFolder['General'].push(note);
      }
    });
    return byFolder;
  }, [notes, folders, searchQuery]);

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
      {/* Presence Avatars */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/40">
        {others.map((other) => (
          <div key={other.connectionId} title={other.info?.name || 'User'}>
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border">
              {other.info?.name ? other.info.name[0].toUpperCase() : '?'}
            </div>
          </div>
        ))}
        {others.length === 0 && (
          <span className="text-xs text-muted-foreground">No one else here</span>
        )}
      </div>
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
      {/* Folders and Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {folders.map((folder: NoteFolder) => {
            const folderNotes = notesByFolder[folder._id] || [];
            return (
              <div key={folder._id} className="mb-4">
                <button
                  onClick={() => onNoteSelect(folder._id)}
                  className="flex items-center gap-2 w-full px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Folder className="h-3 w-3" />
                  <span>{folder.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {folderNotes.length}
                  </Badge>
                </button>
                {folderNotes.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-2">
                    No notes in this folder
                  </div>
                ) : (
                  folderNotes.map((note: Note) => (
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
                  ))
                )}
              </div>
            );
          })}
          {/* General notes (not in any folder) */}
          {notesByFolder['General'] && notesByFolder['General'].length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 w-full px-2 py-2 text-sm font-medium text-muted-foreground">
                <Folder className="h-3 w-3" />
                <span>General</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {notesByFolder['General'].length}
                </Badge>
              </div>
              {notesByFolder['General'].map((note: Note) => (
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
