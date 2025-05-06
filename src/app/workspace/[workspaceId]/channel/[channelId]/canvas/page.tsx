'use client';

import { useEffect, useState, useCallback } from 'react';
import { useChannelId } from '@/hooks/use-channel-id';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { toast } from 'sonner';
import {
    CanvasHeader,
    CanvasCanvas,
    CanvasToolbar,
    CanvasLiveblocksProvider,
    CanvasActiveUsers
} from '@/features/canvas';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { Loader } from 'lucide-react';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { CanvasParticipantsTracker } from '@/features/canvas/_components/canvas-participants-tracker';

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
    const [isLoading, setIsLoading] = useState(true);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [canvasName, setCanvasName] = useState<string | null>(null);
    const [liveMessageId, setLiveMessageId] = useState<Id<"messages"> | null>(null);

    // Get current user
    const { data: currentUser } = useCurrentUser();

    // Mutations for updating and creating messages
    const updateMessage = useMutation(api.messages.update);
    const createMessage = useMutation(api.messages.create);

    // Check if a specific roomId is provided in the URL (for saved canvases)
    const roomIdParam = searchParams.get('roomId');

    // Check if this is a request for a new canvas
    const isNewCanvas = searchParams.get('new') === 'true';

    // Get the saved canvas name if provided in the URL
    const canvasNameParam = searchParams.get('canvasName');

    // Get the timestamp parameter (used to force a fresh page load)
    const timestampParam = searchParams.get('t');

    // Get messages from the channel to find saved canvases and live messages
    const messages = useQuery(
        api.messages.get,
        channelId ? {
            channelId: channelId as Id<"channels">,
            paginationOpts: {
                numItems: 100,
                cursor: null
            }
        } : "skip"
    );

    // Function to find the live message for this canvas session
    const findLiveMessage = useCallback(() => {
        if (!messages || !messages.page || !roomIdParam) return null;

        for (const message of messages.page) {
            try {
                const body = JSON.parse(message.body);

                if (body && body.type === "canvas-live" && body.roomId === roomIdParam) {
                    return message._id;
                }
            } catch (e) {
                // Not a JSON message or not a canvas live message, skip
            }
        }

        return null;
    }, [messages, roomIdParam]);

    useEffect(() => {
        // If a roomId is provided in the URL, use it (this takes priority)
        // This happens when clicking the Canvas button in the chat or when joining from a live message
        if (roomIdParam) {
            console.log(`Using canvas with provided roomId: ${roomIdParam}`);
            setRoomId(roomIdParam);

            // If a canvas name is provided, use it (for saved canvases)
            if (canvasNameParam) {
                console.log(`Using saved canvas name: ${canvasNameParam}`);
                setCanvasName(canvasNameParam);
            } else {
                // For live canvases or new canvases, don't set a name
                setCanvasName(null);
            }

            setIsLoading(false);
            return;
        }

        // If explicitly requesting a new canvas but no roomId is provided, generate one
        if (isNewCanvas) {
            const timestamp = Date.now();
            const newRoomId = `canvas-${channelId}-${timestamp}`;
            console.log(`Creating new canvas with generated roomId: ${newRoomId}`);
            setRoomId(newRoomId);
            setCanvasName(null);
            setIsLoading(false);
            return;
        }

        // Otherwise, try to find the most recent saved canvas
        if (messages && messages.page) {
            // Filter and parse canvas messages
            const canvasMessages: SavedCanvas[] = [];

            for (const message of messages.page) {
                try {
                    const body = JSON.parse(message.body);

                    if (body && body.type === "canvas") {
                        canvasMessages.push({
                            id: message._id,
                            canvasName: body.canvasName,
                            roomId: body.roomId,
                            savedCanvasId: body.savedCanvasId,
                            creationTime: message._creationTime
                        });
                    }
                } catch (e) {
                    // Not a JSON message or not a canvas message, skip
                }
            }

            // Sort by creation time (newest first)
            canvasMessages.sort((a, b) => b.creationTime - a.creationTime);

            if (canvasMessages.length > 0) {
                // Use the most recent canvas
                const mostRecentCanvas = canvasMessages[0];
                console.log(`Loading most recent canvas: ${mostRecentCanvas.canvasName} (${mostRecentCanvas.roomId})`);

                // Set the room ID and canvas name
                setRoomId(mostRecentCanvas.roomId);
                setCanvasName(mostRecentCanvas.canvasName);

                // Update the URL to reflect the loaded canvas (without reloading the page)
                if (workspaceId && channelId) {
                    const newUrl = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${mostRecentCanvas.roomId}&canvasName=${encodeURIComponent(mostRecentCanvas.canvasName)}&t=${Date.now()}`;
                    window.history.replaceState({}, '', newUrl);
                }
            } else {
                // No saved canvases found, create a new one
                const timestamp = Date.now();
                const newRoomId = `canvas-${channelId}-${timestamp}`;
                console.log(`No saved canvases found. Creating new canvas with roomId: ${newRoomId}`);
                setRoomId(newRoomId);
                setCanvasName(null);
            }

            setIsLoading(false);
        }
    }, [messages, roomIdParam, canvasNameParam, isNewCanvas, channelId, workspaceId]);

    // Effect to find the live message
    useEffect(() => {
        if (!roomId || !channelId || !workspaceId || !currentUser || !messages) return;

        // Find the live message for this canvas session
        const messageId = findLiveMessage();

        if (messageId) {
            // Store the message ID for future updates
            setLiveMessageId(messageId);
        }
    }, [roomId, channelId, workspaceId, currentUser, messages, findLiveMessage]);

    // Effect to handle cleanup when the component unmounts
    useEffect(() => {
        return () => {
            // When the component unmounts, remove the live message
            if (liveMessageId) {
                // We could delete the message here, but instead we'll just update it
                // to show that the session has ended
                updateMessage({
                    id: liveMessageId,
                    body: JSON.stringify({
                        type: "canvas",
                        canvasName: canvasName || "Untitled Canvas",
                        roomId: roomId || "",
                        savedCanvasId: `${channelId}-${Date.now()}`,
                    }),
                }).catch(error => {
                    console.error("Error updating live message on unmount:", error);
                });
            }
        };
    }, [liveMessageId, updateMessage, canvasName, roomId, channelId]);

    // Show loading state while determining which canvas to load
    if (isLoading || !roomId) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <CanvasLiveblocksProvider roomId={roomId}>
            <div className="flex flex-col h-full">
                <CanvasActiveUsers />
                {liveMessageId && currentUser && (
                    <CanvasParticipantsTracker
                        roomId={roomId}
                        liveMessageId={liveMessageId}
                        currentUserId={currentUser._id}
                    />
                )}
                <div className="flex flex-1 overflow-hidden">
                    <CanvasToolbar />
                    <div className="flex-1">
                        <CanvasCanvas
                            canvasId={channelId}
                            savedCanvasName={canvasName}
                        />
                    </div>
                </div>
            </div>
        </CanvasLiveblocksProvider>
    );
};

export default CanvasPage;