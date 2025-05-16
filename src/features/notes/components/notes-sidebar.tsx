'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, FolderPlus, FileText, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NoteItem } from './note-item';
import { DraggableNote } from './draggable-note';
import { DraggableFolder } from './draggable-folder';
import { FolderDialog } from './folder-dialog';
import type { Note, NoteFolder, FolderTreeItem } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Id } from '@/../convex/_generated/dataModel';

interface NotesSidebarProps {
  notes: Note[];
  folders: NoteFolder[];
  activeNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: (folderId?: Id<'noteFolders'>) => void;
  onCreateFolder: (parentFolderId?: Id<'noteFolders'>, name?: string) => void;
  onDeleteFolder: (folderId: Id<'noteFolders'>) => void;
  onRenameFolder: (folderId: Id<'noteFolders'>, name: string) => void;
  onMoveNote: (noteId: Id<'notes'>, folderId?: Id<'noteFolders'>) => void;
  onDeleteNote?: (noteId: string) => void;
  className?: string;
}

export const NotesSidebar = ({
  notes,
  folders,
  activeNoteId,
  onNoteSelect,
  onCreateNote,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onMoveNote,
  onDeleteNote,
  className,
}: NotesSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<NoteFolder | null>(null);
  const [selectedParentFolderId, setSelectedParentFolderId] = useState<Id<'noteFolders'> | undefined>(undefined);

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  // Build folder tree structure
  const folderTree = useMemo(() => {
    // Add console log to debug folders
    console.log('Building folder tree with folders:', folders);

    // Function to build the tree recursively
    const buildTree = (parentId?: Id<'noteFolders'>): FolderTreeItem[] => {
      // Get direct children of this parent
      const children = folders?.filter(f => f.parentFolderId === parentId) || [];
      console.log('Children folders with parentId', parentId, ':', children);

      return children.map(folder => {
        // Get notes in this folder
        const folderNotes = notes?.filter(note => note.folderId === folder._id) || [];
        console.log('Notes in folder', folder.name, ':', folderNotes);

        // Get subfolders recursively
        const subfolders = buildTree(folder._id);

        return {
          folder,
          notes: folderNotes,
          subfolders,
          isOpen: true // Set to true by default to make folders visible
        };
      });
    };

    // Handle the case where folders is undefined
    if (!folders || folders.length === 0) {
      console.log('No folders available');
      return [];
    }

    return buildTree(undefined);
  }, [folders, notes]);

  // Get root level notes (not in any folder)
  const rootNotes = useMemo(() => {
    return notes.filter(note => !note.folderId);
  }, [notes]);

  // Filter the entire tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery) return folderTree;

    // Function to filter tree recursively
    const filterTree = (items: FolderTreeItem[]): FolderTreeItem[] => {
      return items
        .map(item => {
          // Filter notes in this folder
          const filteredNotes = item.notes.filter(note =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase())
          );

          // Filter subfolders recursively
          const filteredSubfolders = filterTree(item.subfolders);

          // Include this folder if its name matches or it has matching notes/subfolders
          const folderMatches = item.folder.name.toLowerCase().includes(searchQuery.toLowerCase());

          if (folderMatches || filteredNotes.length > 0 || filteredSubfolders.length > 0) {
            return {
              ...item,
              notes: filteredNotes,
              subfolders: filteredSubfolders,
              isOpen: true // Auto-expand when filtering
            };
          }

          return null;
        })
        .filter((item): item is FolderTreeItem => item !== null);
    };

    return filterTree(folderTree);
  }, [folderTree, searchQuery]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCreateFolder = (parentFolderId?: Id<'noteFolders'>) => {
    setSelectedParentFolderId(parentFolderId);
    setCreateFolderDialogOpen(true);
  };

  const handleRenameFolder = (folder: NoteFolder) => {
    setSelectedFolder(folder);
    setRenameFolderDialogOpen(true);
  };

  const handleCreateFolderSubmit = (name: string) => {
    // Pass both the name and the parent folder ID to the create folder function
    onCreateFolder(selectedParentFolderId, name);
  };

  const handleRenameFolderSubmit = (name: string) => {
    if (selectedFolder) {
      onRenameFolder(selectedFolder._id, name);
    }
  };

  const handleMoveNote = (noteId: string, folderId: Id<'noteFolders'>) => {
    onMoveNote(noteId as Id<'notes'>, folderId);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mb-4"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mt-2"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="right">
            <DropdownMenuItem onClick={() => onCreateNote()} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              New Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateFolder()} className="cursor-pointer">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <>
      {/* Create Folder Dialog */}
      <FolderDialog
        isOpen={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        onSubmit={handleCreateFolderSubmit}
        title="Create Folder"
        description="Enter a name for your new folder"
      />

      {/* Rename Folder Dialog */}
      <FolderDialog
        isOpen={renameFolderDialogOpen}
        onClose={() => setRenameFolderDialogOpen(false)}
        onSubmit={handleRenameFolderSubmit}
        title="Rename Folder"
        description="Enter a new name for this folder"
        folder={selectedFolder || undefined}
      />

      <div
        className={cn(
          'w-64 border-r flex flex-col h-full transition-all duration-300',
          className
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Notes</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCreateNote()} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  New Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateFolder()} className="cursor-pointer">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {searchQuery && filteredNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">
              No notes found
            </p>
          ) : (
            <>
              {/* Folders section */}
              <div className="folder-container mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1">FOLDERS</h3>

                {folders.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">
                    No folders yet - Click + to create one
                  </div>
                ) : (
                  <div className="space-y-1">
                    {folders.map((folder) => {
                      // Get notes that belong to this folder
                      const folderNotes = notes.filter(note => note.folderId === folder._id);

                      return (
                        <DraggableFolder
                          key={folder._id}
                          folder={folder}
                          notes={folderNotes}
                          activeNoteId={activeNoteId}
                          onNoteSelect={onNoteSelect}
                          onDeleteNote={onDeleteNote || (() => { })}
                          onCreateNote={onCreateNote}
                          onDeleteFolder={onDeleteFolder}
                          onRenameFolder={onRenameFolder}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Uncategorized Notes section */}
              <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1 mt-4">NOTES</h3>

              {/* Render root notes (not in any folder) */}
              {(searchQuery ? filteredNotes.filter(note => !note.folderId) : rootNotes).length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  No uncategorized notes
                </div>
              ) : (
                <div className="space-y-1 mt-1">
                  {(searchQuery ? filteredNotes.filter(note => !note.folderId) : rootNotes).map((note) => (
                    <DraggableNote
                      key={note._id}
                      note={note}
                      isActive={activeNoteId === note._id}
                      onClick={() => onNoteSelect(note._id)}
                      onDelete={() => onDeleteNote && onDeleteNote(note._id)}
                    />
                  ))}
                </div>
              )}

              {/* Show empty state if no notes and no folders */}
              {!searchQuery && rootNotes.length === 0 && (!folders || folders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center p-4">
                  No notes or folders yet
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
