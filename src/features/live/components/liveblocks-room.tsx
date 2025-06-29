"use client";

import { ReactNode, useEffect } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveList, LiveMap } from "@liveblocks/client";
import { useQuery } from "convex/react";

import { api } from "@/../convex/_generated/api";
import { RoomProvider } from "@/../liveblocks.config";
import { Loader } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Id } from "@/../convex/_generated/dataModel";

interface LiveblocksRoomProps {
    children: ReactNode;
    roomId: string;
    roomType?: 'canvas' | 'note';
    fallback?: ReactNode;
}

export const LiveblocksRoom = ({ 
    children, 
    roomId, 
    roomType = 'canvas',
    fallback 
}: LiveblocksRoomProps) => {
    // Ensure roomId is a string and normalize it
    const normalizedRoomId = String(roomId).trim();

    // Add a key to force remount when roomId changes
    const key = `${roomType}-room-${normalizedRoomId}`;

    // Get the workspace ID from params
    const workspaceId = useWorkspaceId();

    console.log(`LiveblocksRoom component rendering with normalized roomId: ${normalizedRoomId}, type: ${roomType}`);

    // Get the current user from Convex
    const currentUser = useQuery(api.users.current);

    // Get current member info to pass to Liveblocks
    const currentMember = useQuery(
        api.members.current,
        workspaceId ? { workspaceId } : "skip"
    );

    // Set up user info for Liveblocks authentication
    useEffect(() => {
        if (currentUser && currentMember) {
            console.log("Setting up Liveblocks user info:", {
                userId: currentUser._id,
                name: currentUser.name,
                memberId: currentMember._id,
                roomId: normalizedRoomId,
                roomType
            });
        }
    }, [currentUser, currentMember, normalizedRoomId, roomType]);

    // Show loading state while user data is being fetched
    if (!currentUser || !currentMember) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader className="size-5 animate-spin" />
            </div>
        );
    }

    return (
        // Use the key to force remount when roomId changes
        <div key={key} className="h-full">
            <RoomProvider
                id={normalizedRoomId}
                initialPresence={{
                    cursor: null,
                    selection: [],
                    pencilDraft: null,
                    penColor: null,
                    strokeWidth: 1,
                    isEditing: false,
                    lastActivity: Date.now()
                }}
                initialStorage={{
                    layers: new LiveMap(),
                    layerIds: new LiveList([]),
                    collaborativeNotes: new LiveMap(),
                    lastUpdate: Date.now()
                }}
            >
                <ClientSideSuspense fallback={fallback || <div className="flex h-full w-full items-center justify-center">
                    <Loader className="size-5 animate-spin" />
                </div>}>
                    {() => children}
                </ClientSideSuspense>
            </RoomProvider>
        </div>
    );
};
