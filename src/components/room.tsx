"use client";

import { ReactNode, useEffect } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveList, LiveMap } from "@liveblocks/client";
import { useQuery } from "convex/react";

import { api } from "@/../convex/_generated/api";
import { RoomProvider } from "@/../liveblocks.config";
import { Loader } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface RoomProps {
    children: ReactNode;
    roomId: string;
    fallback?: ReactNode;
}

export const Room = ({ children, roomId, fallback }: RoomProps) => {
    // Ensure roomId is a string and normalize it
    const normalizedRoomId = String(roomId).trim();

    // Add a key to force remount when roomId changes
    const key = `room-${normalizedRoomId}`;

    // Get the workspace ID from params
    const workspaceId = useWorkspaceId();

    console.log("Room component rendering with normalized roomId:", normalizedRoomId);

    // Get the current user from Convex
    const currentUser = useQuery(api.users.current);

    // Get current member info to pass to Liveblocks
    const currentMember = useQuery(
        api.members.current,
        workspaceId ? { workspaceId } : "skip"
    );

    // Log authentication info for debugging
    useEffect(() => {
        if (currentUser && currentMember) {
            console.log("Authentication info for Liveblocks:", {
                userId: currentUser._id,
                memberId: currentMember._id,
                name: currentUser.name || "Unknown User"
            });
        }
    }, [currentUser, currentMember]);

    // If user data is still loading, show a loading indicator
    if (!currentUser) {
        return <div className="flex items-center justify-center h-full">Loading canvas...</div>;
    }

    // Verify we have a valid room ID
    if (!normalizedRoomId) {
        console.error("Invalid room ID provided to Room component");
        return <div className="flex items-center justify-center h-full">Error: Invalid room ID</div>;
    }

    // Set up query parameters with user and member IDs
    // These will be passed to the liveblocks-auth endpoint
    const authParams = new URLSearchParams();
    if (currentUser?._id) authParams.set("userId", currentUser._id);
    if (currentMember?._id) authParams.set("memberId", currentMember._id);
    if (currentUser?.name) authParams.set("userName", currentUser.name);
    if (currentUser?.image) authParams.set("userAvatar", currentUser.image);

    return (
        // Use the key to force remount when roomId changes
        <div key={key} className="h-full">
            <RoomProvider
                id={normalizedRoomId}
                initialPresence={{
                    cursor: null,
                    selection: [],
                    pencilDraft: null,
                    penColor: { r: 0, g: 0, b: 0 } // Default to black
                }}
                initialStorage={{
                    layers: new LiveMap(),
                    layerIds: new LiveList([]),
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
}