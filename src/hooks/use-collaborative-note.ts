import { useState, useEffect, useCallback, useRef } from 'react';
import { useStorage, useMutation } from '@/../liveblocks.config';
import { LiveObject, LiveMap } from '@liveblocks/client';
import { Id } from '@/../convex/_generated/dataModel';
import { Note } from '@/features/notes/types';

interface CollaborativeNoteData {
  [key: string]: any; // Index signature for Liveblocks compatibility
  content: string;
  title: string;
  lastModified: number;
  lastModifiedBy: string;
}

interface UseCollaborativeNoteOptions {
  noteId: Id<'notes'> | string;
  initialNote?: Note;
  onDatabaseSave?: (updates: Partial<Note>) => Promise<void>;
  autoSaveInterval?: number;
}

interface UseCollaborativeNoteReturn {
  content: string;
  title: string;
  isLoading: boolean;
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  saveToDatabase: () => Promise<void>;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

export const useCollaborativeNote = ({
  noteId,
  initialNote,
  onDatabaseSave,
  autoSaveInterval = 30000, // 30 seconds
}: UseCollaborativeNoteOptions): UseCollaborativeNoteReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDatabaseSaveRef = useRef<string>('');

  // Get the collaborative note data from Liveblocks storage
  const noteData = useStorage((root) => {
    const noteKey = `note-${noteId}`;
    return root.collaborativeNotes?.get(noteKey);
  });

  // Mutation to update the collaborative note in Liveblocks
  const updateNoteData = useMutation(({ storage }, updates: Partial<CollaborativeNoteData>) => {
    let collaborativeNotes = storage.get('collaborativeNotes');
    if (!collaborativeNotes) {
      collaborativeNotes = new LiveMap();
      storage.set('collaborativeNotes', collaborativeNotes);
    }

    const noteKey = `note-${noteId}`;
    const currentData = collaborativeNotes.get(noteKey);

    if (currentData) {
      // Update existing note
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          currentData.set(key, value);
        }
      });
    } else {
      // Create new collaborative note
      const newNoteData = new LiveObject({
        content: initialNote?.content || '',
        title: initialNote?.title || 'Untitled',
        lastModified: Date.now(),
        lastModifiedBy: 'current-user', // This should be replaced with actual user ID
        ...updates,
      });
      collaborativeNotes.set(noteKey, newNoteData);
    }
  }, [noteId, initialNote]);

  // Initialize the collaborative note if it doesn't exist
  useEffect(() => {
    if (initialNote && !noteData) {
      updateNoteData({
        content: initialNote.content || '',
        title: initialNote.title || 'Untitled',
        lastModified: Date.now(),
        lastModifiedBy: 'current-user',
      });
    }
    setIsLoading(false);
  }, [initialNote, noteData, updateNoteData]);

  // Update content in Liveblocks (real-time)
  const updateContent = useCallback((content: string) => {
    updateNoteData({
      content,
      lastModified: Date.now(),
      lastModifiedBy: 'current-user',
    });
    setHasUnsavedChanges(true);
    
    // Reset auto-save timer
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new auto-save timer
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToDatabase();
    }, autoSaveInterval);
  }, [updateNoteData, autoSaveInterval]);

  // Update title in Liveblocks (real-time)
  const updateTitle = useCallback((title: string) => {
    updateNoteData({
      title,
      lastModified: Date.now(),
      lastModifiedBy: 'current-user',
    });
    setHasUnsavedChanges(true);
    
    // Reset auto-save timer
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new auto-save timer
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToDatabase();
    }, autoSaveInterval);
  }, [updateNoteData, autoSaveInterval]);

  // Save to database (debounced)
  const saveToDatabase = useCallback(async () => {
    if (!noteData || !onDatabaseSave) return;
    
    const currentContent = noteData.content + noteData.title; // Simple hash
    if (currentContent === lastDatabaseSaveRef.current) {
      return; // No changes to save
    }
    
    try {
      await onDatabaseSave({
        content: noteData.content,
        title: noteData.title,
      });
      
      lastDatabaseSaveRef.current = currentContent;
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save to database:', error);
    }
  }, [noteData, onDatabaseSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    content: noteData?.content || initialNote?.content || '',
    title: noteData?.title || initialNote?.title || 'Untitled',
    isLoading,
    updateContent,
    updateTitle,
    saveToDatabase,
    hasUnsavedChanges,
    lastSaved,
  };
};
