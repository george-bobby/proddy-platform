'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Folder, FileText, Users, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Note, NoteFolder } from '../types';
import { Id } from '@/../convex/_generated/dataModel';

interface EnhancedNotesSidebarProps {
  notes: Note[];
  folders: NoteFolder[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  collapsed: boolean;
  onCreateNote: (folderId?: Id<'noteFolders'>) => void;
  onCreateFolder: () => void;
}

// Define categories that match the mockup design
const NOTE_CATEGORIES = [
  { name: 'Project Management', color: 'bg-blue-100 text-blue-800' },
  { name: 'Development', color: 'bg-green-100 text-green-800' },
  { name: 'Meetings', color: 'bg-purple-100 text-purple-800' },
  { name: 'General', color: 'bg-gray-100 text-gray-800' },
];

export const EnhancedNotesSidebar = ({
  notes,
  folders,
  selectedNoteId,
  onNoteSelect,
  collapsed,
  onCreateNote,
  onCreateFolder,
}: EnhancedNotesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(NOTE_CATEGORIES.map(cat => cat.name))
  );

  // Group notes by category (using folder names as categories)
  const notesByCategory = useMemo(() => {
    const filteredNotes = notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    });

    const categorized: Record<string, Note[]> = {};
    
    // Initialize categories
    NOTE_CATEGORIES.forEach(category => {
      categorized[category.name] = [];
    });

    // Categorize notes based on their folder
    filteredNotes.forEach(note => {
      if (note.folderId) {
        const folder = folders.find(f => f._id === note.folderId);
        const categoryName = folder?.name || 'General';
        
        // Find matching category or default to General
        const category = NOTE_CATEGORIES.find(cat => cat.name === categoryName)?.name || 'General';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(note);
      } else {
        categorized['General'].push(note);
      }
    });

    return categorized;
  }, [notes, folders, searchQuery]);

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

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

      {/* Categories and Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {NOTE_CATEGORIES.map(category => {
            const categoryNotes = notesByCategory[category.name] || [];
            const isExpanded = expandedCategories.has(category.name);
            
            return (
              <div key={category.name} className="mb-4">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex items-center gap-2 w-full px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <Folder className="h-3 w-3" />
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {categoryNotes.length}
                  </Badge>
                </button>
                
                {isExpanded && (
                  <div className="ml-4 space-y-1 mt-2">
                    {categoryNotes.length === 0 ? (
                      <div className="text-xs text-muted-foreground px-2 py-2">
                        No notes in this category
                      </div>
                    ) : (
                      categoryNotes.map(note => (
                        <button
                          key={note._id}
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
                              {note.tags.slice(0, 2).map(tag => (
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
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
