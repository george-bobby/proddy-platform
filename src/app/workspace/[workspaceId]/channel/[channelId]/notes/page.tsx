'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { FileText, Plus, FolderPlus, Save } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { EmptyNotes } from '@/features/notes/components/empty-notes';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { FolderDialog } from '@/features/notes/components/folder-dialog';
import { useConfirm } from '@/hooks/use-confirm';
import { DndContext, DragEndEvent, closestCenter, useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { NotesRoom } from '@/features/notes/components/notes-room';
import { NotesParticipantsTracker } from '@/features/notes/components/notes-participants-tracker';
import { NotesCursorsPresence } from '@/features/notes/components/notes-cursors-presence';
import { DraggableFolder } from '@/features/notes/components/draggable-folder';
import { DraggableNote } from '@/features/notes/components/draggable-note';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useDocumentTitle } from '@/hooks/use-document-title';

const NotesPage = () => {
    const params = useParams();
    const workspaceId = params.workspaceId as Id<'workspaces'>;
    const channelId = params.channelId as Id<'channels'>;
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Note",
        "Are you sure you want to delete this note? This action cannot be undone."
    );

    // State
    const [activeNoteId, setActiveNoteId] = useState<Id<'notes'> | null>(null);
    const [title, setTitle] = useState('Untitled');
    const [content, setContent] = useState(JSON.stringify({ ops: [{ insert: '\n' }] }));
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState<Id<'notes'>[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<Id<'noteFolders'>[]>([]);

    // Local state for temporary items
    const [localNotes, setLocalNotes] = useState<any[]>([]);
    const [localFolders, setLocalFolders] = useState<any[]>([]);

    // Get the current user
    const { data: currentUser } = useCurrentUser();

    // Get channel information for the title
    const channel = useQuery(api.channels.getById, { id: channelId });

    // Set document title based on channel name
    useDocumentTitle(channel ? `Notes - ${channel.name}` : 'Notes');

    // Convex queries
    const notes = useQuery(api.notes.list, {
        workspaceId,
        channelId,
    }) || [];

    const folders = useQuery(api.noteFolders.list, {
        workspaceId,
        channelId,
    }) || [];

    // Alias for compatibility with existing code
    const convexFolders = folders;

    // Get active note
    const activeNote = useQuery(
        api.notes.get,
        activeNoteId ? { id: activeNoteId } : 'skip'
    );

    // Convex mutations
    const createNote = useMutation(api.notes.create);
    const updateNote = useMutation(api.notes.update);
    const createFolder = useMutation(api.noteFolders.create);
    const deleteNote = useMutation(api.notes.remove);
    const createMessage = useMutation(api.messages.create);
    const deleteFolder = useMutation(api.noteFolders.remove);
    const updateFolder = useMutation(api.noteFolders.update);

    // Update title and content when active note changes
    useEffect(() => {
        if (activeNote) {
            setTitle(activeNote.title);
            setContent(activeNote.content);
        }
    }, [activeNote]);

    // Function to open the folder creation dialog
    const openFolderDialog = () => {
        setIsFolderDialogOpen(true);
    };

    // Wrapper functions for DraggableFolder component
    const handleNoteSelectWrapper = (noteId: string) => {
        setActiveNoteId(noteId as Id<'notes'>);
    };

    // Wrapper for handleDeleteNote to match the expected prop type
    const handleDeleteNoteWrapper = (noteId: string) => {
        handleDeleteNote(noteId as Id<'notes'>);
    };

    // Handle note creation
    const handleCreateNote = async (folderId?: Id<'noteFolders'>) => {
        try {
            console.log('Creating note with folderId:', folderId);
            const defaultTitle = 'Untitled';
            const defaultContent = JSON.stringify({ ops: [{ insert: '\n' }] });

            // Create the note in Convex
            const noteId = await createNote({
                title: defaultTitle,
                content: defaultContent,
                workspaceId,
                channelId,
                folderId,
            });

            if (noteId) {
                // Set the active note ID
                setActiveNoteId(noteId);

                // Set title and content
                setTitle(defaultTitle);
                setContent(defaultContent);

                toast.success('Note created');

                // Create a message in the channel
                try {
                    await createMessage({
                        workspaceId,
                        channelId,
                        body: JSON.stringify({
                            type: 'note',
                            noteId: noteId,
                            noteTitle: defaultTitle,
                            previewContent: 'New note created',
                            folderId,
                        }),
                    });
                } catch (err) {
                    console.error('Failed to create message:', err);
                }
            }
        } catch (error) {
            console.error('Failed to create note:', error);
            toast.error('Failed to create note');
        }
    };

    // Handle folder creation
    const handleCreateFolder = async (name: string, parentFolderId?: Id<'noteFolders'>) => {
        try {
            const folderName = name && name.trim() !== '' ? name : 'New Folder';
            console.log('Creating folder with name:', folderName);

            // Close the dialog
            setIsFolderDialogOpen(false);

            // Create the folder in Convex
            await createFolder({
                name: folderName,
                workspaceId,
                channelId,
                parentFolderId,
            });

            toast.success(`Folder "${folderName}" created`);
        } catch (error) {
            console.error('Failed to create folder:', error);
            toast.error('Failed to create folder');
        }
    };

    // Handle title change
    const handleTitleChange = (newTitle: string) => {
        // Skip if title hasn't changed
        if (newTitle === title) return;

        setTitle(newTitle);
        setIsEditing(true);
    };

    // Handle content change
    const handleContentChange = (newContent: string) => {
        // Only update if content has changed
        if (newContent !== content) {
            // Update content state directly
            setContent(newContent);

            // Mark as editing
            setIsEditing(true);
        }
    };

    // Handle save
    const handleSaveNote = async () => {
        if (!activeNoteId) return;

        try {
            // First, update the note
            await updateNote({
                id: activeNoteId,
                title: title,
                content: content,
            });

            // Reset editing state
            setIsEditing(false);

            // Show success message
            toast.success('Note saved');
        } catch (error) {
            console.error('Failed to save note:', error);
            toast.error('Failed to save note');
        }
    };

    // Handle note deletion
    const handleDeleteNote = async (noteId: Id<'notes'>) => {
        try {
            console.log('Deleting note with ID:', noteId);

            // Confirm deletion
            const shouldDelete = await confirm();
            if (!shouldDelete) return;

            // If the active note is being deleted, clear it first
            if (activeNoteId === noteId) {
                setActiveNoteId(null);
                setTitle('');
                setContent('');
            }

            // Delete the note from the database
            await deleteNote({ id: noteId });
            console.log('Note deleted from database:', noteId);

            // Remove the note from local state if it exists there
            setLocalNotes(prev => {
                const filtered = prev.filter(note => note._id !== noteId);
                console.log('Filtered local notes:', filtered);
                return filtered;
            });

            toast.success('Note deleted successfully');
        } catch (error) {
            console.error('Failed to delete note:', error);
            toast.error('Failed to delete note: ' + (error instanceof Error ? error.message : String(error)));

            // Even if there's an error, update the UI to remove the note
            // This helps with UI consistency in case the note was actually deleted but there was an error in the response
            setLocalNotes(prev => prev.filter(note => note._id !== noteId));
        }
    };

    // Handle image upload
    const handleImageUpload = (storageId: Id<'_storage'>) => {
        if (!activeNoteId) return;

        updateNote({
            id: activeNoteId,
            coverImage: storageId,
        });
    };

    // Handle folder deletion
    const handleDeleteFolder = async (folderId: Id<'noteFolders'>) => {
        try {
            console.log('Deleting folder with ID:', folderId);

            // Confirm deletion
            const shouldDelete = await confirm();
            if (!shouldDelete) return;

            // Find notes in this folder
            const notesInFolder = notes.filter(note => note.folderId === folderId);
            console.log('Notes in folder to delete:', notesInFolder);

            // If any active note was in this folder, clear it first
            const activeNoteInFolder = notesInFolder.some(note => note._id === activeNoteId);
            if (activeNoteInFolder) {
                setActiveNoteId(null);
                setTitle('');
                setContent('');
            }

            // Delete the folder from the database
            // The Convex API will handle cascading deletion of notes
            await deleteFolder({ id: folderId });
            console.log('Folder deleted from database:', folderId);

            // Remove the folder from local state if it exists there
            setLocalFolders(prev => {
                const filtered = prev.filter(folder => folder._id !== folderId);
                console.log('Filtered local folders:', filtered);
                return filtered;
            });

            toast.success('Folder and its contents deleted');
        } catch (error) {
            console.error('Failed to delete folder:', error);
            toast.error('Failed to delete folder: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    // Handle folder renaming
    const handleRenameFolder = async (folderId: Id<'noteFolders'>, name: string) => {
        try {
            if (!name || name.trim() === '') {
                toast.error('Folder name cannot be empty');
                return;
            }

            // Update the folder in the database
            await updateFolder({
                id: folderId,
                name,
            });

            toast.success(`Folder renamed to "${name}"`);
        } catch (error) {
            console.error('Failed to rename folder:', error);
            toast.error('Failed to rename folder');
        }
    };

    // Define a simple loading state
    const isLoading = false;

    // Set up DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement required before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle drag end from DndContext
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        // If the draggable item was dropped over a different droppable container
        if (active.id !== over.id) {
            const noteId = active.id as Id<'notes'>;
            const folderId = over.id as Id<'noteFolders'>;

            console.log(`Moving note ${noteId} to folder ${folderId}`);

            try {
                // Update the note in the database with the new folder ID
                await updateNote({
                    id: noteId,
                    folderId: folderId,
                });

                toast.success('Note moved to folder');
            } catch (error) {
                console.error('Failed to move note to folder:', error);
                toast.error('Failed to move note to folder');
            }
        }
    };

    // Toggle selection mode
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        // Clear selections when toggling off
        if (isSelectionMode) {
            setSelectedNotes([]);
            setSelectedFolders([]);
        }
    };

    // Toggle note selection
    const toggleNoteSelection = (noteId: Id<'notes'>, event: React.MouseEvent<Element, MouseEvent>) => {
        event.stopPropagation();

        setSelectedNotes(prev => {
            if (prev.includes(noteId)) {
                return prev.filter(id => id !== noteId);
            } else {
                return [...prev, noteId];
            }
        });
    };

    // Toggle folder selection
    const toggleFolderSelection = (folderId: Id<'noteFolders'>, event: React.MouseEvent<Element, MouseEvent>) => {
        event.stopPropagation();

        setSelectedFolders(prev => {
            if (prev.includes(folderId)) {
                return prev.filter(id => id !== folderId);
            } else {
                return [...prev, folderId];
            }
        });
    };

    // Delete selected items
    const handleDeleteSelected = async () => {
        try {
            // Confirm deletion
            const shouldDelete = await confirm();
            if (!shouldDelete) return;

            console.log('Deleting selected items:', {
                notes: selectedNotes,
                folders: selectedFolders
            });

            // If active note is being deleted, clear it
            if (activeNoteId && selectedNotes.includes(activeNoteId)) {
                setActiveNoteId(null);
                setTitle('');
                setContent('');
            }

            // Delete selected notes
            for (const noteId of selectedNotes) {
                await deleteNote({ id: noteId });
            }

            // Delete selected folders
            for (const folderId of selectedFolders) {
                await deleteFolder({ id: folderId });
            }

            // Clear selections
            setSelectedNotes([]);
            setSelectedFolders([]);

            // Exit selection mode
            setIsSelectionMode(false);

            toast.success('Selected items deleted successfully');
        } catch (error) {
            console.error('Failed to delete selected items:', error);
            toast.error('Failed to delete selected items: ' + (error instanceof Error ? error.message : String(error)));
        }
    };

    // Show empty state if no notes and no folders
    if (notes.length === 0 && folders.length === 0) {
        return (
            <>
                <EmptyNotes
                    onCreate={() => handleCreateNote()}
                    onCreateFolder={openFolderDialog}
                />
                <FolderDialog
                    isOpen={isFolderDialogOpen}
                    onClose={() => setIsFolderDialogOpen(false)}
                    onSubmit={handleCreateFolder}
                    title="Create Folder"
                    description="Enter a name for your new folder"
                />
            </>
        );
    }

    // Debug render
    console.log('Rendering NotesPage');

    return (
        <>
            <ConfirmDialog />
            <FolderDialog
                isOpen={isFolderDialogOpen}
                onClose={() => setIsFolderDialogOpen(false)}
                onSubmit={handleCreateFolder}
                title="Create Folder"
                description="Enter a name for your new folder"
            />
            <div className="flex h-full bg-white">
                {/* Wrap the sidebar in DndContext */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="w-64 h-full border-r overflow-y-auto p-4">
                        {/* Selection mode controls */}
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant={isSelectionMode ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={toggleSelectionMode}
                            >
                                {isSelectionMode ? "Exit Selection" : "Select Multiple"}
                            </Button>

                            {isSelectionMode && (selectedNotes.length > 0 || selectedFolders.length > 0) && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs"
                                    onClick={handleDeleteSelected}
                                >
                                    Delete Selected ({selectedNotes.length + selectedFolders.length})
                                </Button>
                            )}
                        </div>

                        {/* Folders section */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold text-muted-foreground">FOLDERS</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // If in selection mode, exit it first
                                        if (isSelectionMode) {
                                            setIsSelectionMode(false);
                                            setSelectedNotes([]);
                                            setSelectedFolders([]);
                                        }
                                        openFolderDialog();
                                    }}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            {(convexFolders && convexFolders.length > 0) || localFolders.length > 0 ? (
                                <div className="space-y-1">
                                    {/* Show folders from Convex */}
                                    {convexFolders && convexFolders.map((folder) => (
                                        <DraggableFolder
                                            key={folder._id}
                                            folder={folder}
                                            notes={[
                                                ...(notes?.filter(note => note.folderId === folder._id) || []),
                                                ...localNotes.filter(note => note.folderId === folder._id)
                                            ]}
                                            activeNoteId={activeNoteId}
                                            onNoteSelect={handleNoteSelectWrapper}
                                            onDeleteNote={handleDeleteNoteWrapper}
                                            onCreateNote={(folderId) => handleCreateNote(folderId)}
                                            onDeleteFolder={() => handleDeleteFolder(folder._id)}
                                            onRenameFolder={(folderId, name) => handleRenameFolder(folderId, name)}
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedFolders.includes(folder._id)}
                                            onToggleSelect={toggleFolderSelection}
                                            selectedNotes={selectedNotes}
                                            onToggleNoteSelect={toggleNoteSelection}
                                        />
                                    ))}

                                    {/* Show local folders that aren't in Convex yet */}
                                    {localFolders
                                        .filter(localFolder =>
                                            !convexFolders ||
                                            !convexFolders.some(cf => cf._id === localFolder._id)
                                        )
                                        .map((folder) => (
                                            <DraggableFolder
                                                key={folder._id}
                                                folder={folder}
                                                notes={localNotes.filter(note => note.folderId === folder._id)}
                                                activeNoteId={activeNoteId}
                                                onNoteSelect={handleNoteSelectWrapper}
                                                onDeleteNote={handleDeleteNoteWrapper}
                                                onCreateNote={(folderId) => handleCreateNote(folderId)}
                                                onDeleteFolder={() => handleDeleteFolder(folder._id)}
                                                onRenameFolder={(folderId, name) => handleRenameFolder(folderId, name)}
                                                isSelectionMode={isSelectionMode}
                                                isSelected={selectedFolders.includes(folder._id)}
                                                onToggleSelect={toggleFolderSelection}
                                                selectedNotes={selectedNotes}
                                                onToggleNoteSelect={toggleNoteSelection}
                                            />
                                        ))
                                    }
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground p-2">
                                    No folders yet - Click + to create one
                                </div>
                            )}
                        </div>

                        {/* Notes section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold text-muted-foreground">NOTES</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // If in selection mode, exit it first
                                        if (isSelectionMode) {
                                            setIsSelectionMode(false);
                                            setSelectedNotes([]);
                                            setSelectedFolders([]);
                                        }
                                        handleCreateNote();
                                    }}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Filter notes to only show those not in folders */}
                            {((notes && notes.filter(note => !note.folderId).length > 0) ||
                                localNotes.filter(note => !note.folderId).length > 0) ? (
                                <div className="space-y-1">
                                    {/* Combine Convex notes and local notes */}
                                    {[
                                        ...(notes?.filter(note => !note.folderId) || []),
                                        ...localNotes.filter(note => !note.folderId)
                                    ].map(note => (
                                        <DraggableNote
                                            key={note._id}
                                            note={note}
                                            isActive={activeNoteId === note._id}
                                            onClick={() => handleNoteSelectWrapper(note._id)}
                                            onDelete={() => handleDeleteNoteWrapper(note._id)}
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedNotes.includes(note._id)}
                                            onToggleSelect={toggleNoteSelection}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground p-2">
                                    No notes outside folders
                                </div>
                            )}
                        </div>
                    </div>
                </DndContext>
                {activeNoteId ? (
                    <div className="flex-1 overflow-hidden border-l">
                        <NotesRoom noteId={activeNoteId}>
                            {/* Add cursor presence - positioned absolutely within the editor */}
                            <div className="absolute inset-0 pointer-events-none z-50">
                                <NotesCursorsPresence />
                            </div>
                            {currentUser && (
                                <NotesParticipantsTracker
                                    roomId={`note-${activeNoteId}`}
                                    noteId={activeNoteId}
                                    currentUserId={currentUser._id}
                                />
                            )}
                            <NoteEditor
                                key={activeNoteId} // Add key to force refresh when note changes
                                title={title || 'Untitled'} // Provide fallback title
                                content={content || JSON.stringify({ ops: [{ insert: '\n' }] })} // Provide fallback content
                                onTitleChange={handleTitleChange}
                                onContentChange={handleContentChange}
                                onSaveNote={handleSaveNote}
                                onImageUpload={handleImageUpload}
                                isLoading={isLoading}
                                noteId={activeNoteId}
                                workspaceId={workspaceId}
                                channelId={channelId}
                            />
                        </NotesRoom>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">Select a note or create a new one</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Choose a note from the sidebar or create a new one to get started
                            </p>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // If in selection mode, exit it first
                                    if (isSelectionMode) {
                                        setIsSelectionMode(false);
                                        setSelectedNotes([]);
                                        setSelectedFolders([]);
                                    }
                                    handleCreateNote();
                                }}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create a new note
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotesPage;