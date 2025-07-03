'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useChannelId } from '@/hooks/use-channel-id';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { toast } from 'sonner';
import {
    CanvasCanvas,
    CanvasToolbar
} from '@/features/canvas';
import { LiveblocksRoom, LiveParticipants, LiveHeader, LiveSidebar } from '@/features/live';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { Loader, PaintBucket } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { CanvasParticipantsTracker } from '@/features/canvas/components/participants-tracker';
import { Button } from '@/components/ui/button';
import { StreamAudioRoom } from '@/features/audio';

// Interface for saved canvas data
interface SavedCanvas {
    id: Id<"messages">;
    canvasName: string;
    roomId: string;
    savedCanvasId: string;
    creationTime: number;
}

const CanvasPage = () => {
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();
    const searchParams = useSearchParams();
    const router = useRouter();

    // State - simplified like notes page
    const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);

    // Create a reference to the main container for full screen functionality
    const pageContainerRef = useRef<HTMLDivElement>(null);

    // Get channel information for the title
    const channel = useQuery(api.channels.getById, { id: channelId });

    // Set document title based on channel name
    useDocumentTitle(channel ? `Canvas - ${channel.name}` : "Canvas");

    // Get current user
    const { data: currentUser } = useCurrentUser();

    // Get messages from the channel to find saved canvases
    const messages = useQuery(
        api.messages.get,
        channelId ? {
            channelId: channelId,
            paginationOpts: {
                numItems: 100,
                cursor: null
            }
        } : "skip"
    );

    // Parse canvas messages for the sidebar
    const canvasItems = useMemo(() => {
        const canvasMessages: any[] = [];
        if (messages?.page) {
            messages.page.forEach((message) => {
                try {
                    const body = JSON.parse(message.body);
                    if (body.type === "canvas" && body.canvasName && body.roomId) {
                        canvasMessages.push({
                            _id: message._id,
                            canvasName: body.canvasName,
                            roomId: body.roomId,
                            savedCanvasId: body.savedCanvasId,
                            createdAt: message._creationTime,
                            updatedAt: message._creationTime
                        });
                    }
                } catch (error) {
                    // Skip invalid JSON
                }
            });
        }
        return canvasMessages;
    }, [messages]);

    // Get active canvas
    const activeCanvas = activeCanvasId ? canvasItems.find(item => item._id === activeCanvasId || item.roomId === activeCanvasId) : null;

    // Function to toggle full screen
    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            // Enter full screen - use the page container element
            if (pageContainerRef?.current) {
                pageContainerRef.current.requestFullscreen().then(() => {
                    setIsFullScreen(true);
                }).catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            }
        } else {
            // Exit full screen
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullScreen(false);
                }).catch(err => {
                    console.error(`Error attempting to exit full-screen mode: ${err.message}`);
                });
            }
        }
    }, [pageContainerRef]);

    // Mutations for updating and creating messages
    const updateMessage = useMutation(api.messages.update);
    const createMessage = useMutation(api.messages.create);
    const deleteMessage = useMutation(api.messages.remove);

    // Handle canvas selection from sidebar - simplified like notes
    const handleCanvasSelect = useCallback((canvasId: string) => {
        setActiveCanvasId(canvasId);
    }, []);

    // Handle canvas deletion
    const handleDeleteCanvas = useCallback(async (canvasId: string) => {
        if (window.confirm('Are you sure you want to delete this canvas?')) {
            try {
                await deleteMessage({ id: canvasId as Id<"messages"> });
                toast.success('Canvas deleted successfully');
                // If the deleted canvas was active, clear the selection
                if (activeCanvasId === canvasId) {
                    setActiveCanvasId(null);
                }
            } catch (error) {
                toast.error('Failed to delete canvas');
                console.error('Error deleting canvas:', error);
            }
        }
    }, [deleteMessage, activeCanvasId]);

    // Function to create a new canvas - simplified like notes
    const handleCreateCanvas = async () => {
        if (!workspaceId || !channelId || !currentUser) {
            toast.error("Cannot create canvas: missing required data");
            return;
        }

        try {
            setIsCreatingCanvas(true);

            // Generate a unique canvas ID and room ID
            const canvasId = `${channelId}-${Date.now()}`;
            const roomId = `canvas-${canvasId}`;
            const canvasName = "Untitled Canvas";

            // Create a canvas message in the channel
            const messageId = await createMessage({
                workspaceId: workspaceId,
                channelId: channelId as Id<"channels">,
                body: JSON.stringify({
                    type: "canvas",
                    roomId: roomId,
                    canvasName: canvasName,
                    savedCanvasId: canvasId,
                }),
            });

            // Set the new canvas as active
            setActiveCanvasId(messageId);
            toast.success("Canvas created successfully");
        } catch (error) {
            console.error("Error creating canvas:", error);
            toast.error("Failed to create canvas");
        } finally {
            setIsCreatingCanvas(false);
        }
    };

    // Show empty state if no canvas is selected (like notes page)
    if (!activeCanvas) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-y-6 bg-white">
                <PaintBucket className="size-16 text-secondary" />
                <h2 className="text-2xl font-semibold">Canvas</h2>
                <p className="text-sm text-muted-foreground mb-2">Create a new canvas to start drawing and collaborating</p>
                <Button
                    onClick={handleCreateCanvas}
                    disabled={isCreatingCanvas}
                    className="flex items-center gap-2"
                >
                    {isCreatingCanvas ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Creating Canvas...
                        </>
                    ) : (
                        <>
                            <PaintBucket className="h-4 w-4" />
                            Create New Canvas
                        </>
                    )}
                </Button>
            </div>
        );
    }

    // Main render - canvas is selected
    return (
        <LiveblocksRoom roomId={activeCanvas.roomId} roomType="canvas">
            <div ref={pageContainerRef} className={`flex h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
                {/* Canvas Sidebar - hidden in fullscreen */}
                {!isFullScreen && (
                    <LiveSidebar
                        type="canvas"
                        items={canvasItems}
                        selectedItemId={activeCanvasId}
                        onItemSelect={(canvasId) => handleCanvasSelect(canvasId)}
                        collapsed={sidebarCollapsed}
                        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                        onCreateItem={handleCreateCanvas}
                        onDeleteItem={handleDeleteCanvas}
                        workspaceId={workspaceId}
                        channelId={channelId}
                    />
                )}

                <div className="flex flex-col flex-1 overflow-hidden relative">
                    {/* Canvas Header - hidden in fullscreen */}
                    {!isFullScreen && (
                        <LiveHeader
                            type="canvas"
                            title={activeCanvas.canvasName}
                            onTitleChange={(newTitle) => {
                                // Update canvas name
                                console.log('Title changed to:', newTitle);
                                // You can implement canvas title update here
                            }}
                            onSave={() => {
                                // Implement canvas save functionality
                                console.log('Save canvas');
                                toast.success("Canvas saved successfully");
                            }}
                            onCreateItem={handleCreateCanvas}
                            hasUnsavedChanges={false} // You can track canvas changes here
                            toggleFullScreen={toggleFullScreen}
                            isFullScreen={isFullScreen}
                            showFullScreenToggle={true}
                        />
                    )}

                    {/* Live Participants - always visible, positioned absolutely */}
                    <LiveParticipants variant="canvas" isFullScreen={isFullScreen} />

                    <div className="flex flex-1 overflow-hidden">
                        {/* Toolbar - hidden in fullscreen */}
                        {!isFullScreen && <CanvasToolbar />}

                        <div className="flex-1">
                            <CanvasCanvas
                                canvasId={channelId}
                                savedCanvasName={activeCanvas.canvasName}
                                toggleFullScreen={toggleFullScreen}
                                isFullScreen={isFullScreen}
                            />
                        </div>
                    </div>
                </div>
                {/* Audio Room Component */}
                {activeCanvas.roomId && (
                    <StreamAudioRoom
                        roomId={activeCanvas.roomId}
                        workspaceId={workspaceId}
                        channelId={channelId}
                        canvasName={activeCanvas.canvasName || 'Canvas Audio Room'}
                        isFullScreen={isFullScreen}
                    />
                )}
            </div>
        </LiveblocksRoom>
    );
};

export default CanvasPage;
