'use client';

import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { TestNotesHeader } from '@/app/test/components/test-notes-header';
import { TestNotesSidebar } from '@/app/test/components/test-notes-sidebar';
import { TestNotesEditor } from '@/app/test/components/test-notes-editor';
import { TEST_NOTES } from '@/app/test/data/shared-test-data';

const TestNotesPage = () => {
  useDocumentTitle('Notes');
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>('note-1');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notes, setNotes] = useState(TEST_NOTES);

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleNoteUpdate = (noteId: string, updates: Partial<typeof selectedNote>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
  };

  const handleCreateNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      folder: 'General',
      isShared: false,
      collaborators: []
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  return (
    <div className="flex h-full flex-col">
      <TestNotesHeader 
        selectedNote={selectedNote}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
        onCreateNote={handleCreateNote}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <TestNotesSidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onNoteSelect={handleNoteSelect}
          collapsed={sidebarCollapsed}
          onCreateNote={handleCreateNote}
        />
        
        <div className="flex-1 overflow-hidden">
          {selectedNote ? (
            <TestNotesEditor
              note={selectedNote}
              onUpdate={(updates) => handleNoteUpdate(selectedNote.id, updates)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">No note selected</div>
                <div className="text-sm">Select a note from the sidebar or create a new one</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestNotesPage;
