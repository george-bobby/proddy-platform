"use client";

import { ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveList, LiveMap } from "@liveblocks/client";
import { useQuery } from "convex/react";

import { api } from "@/../convex/_generated/api";
import { RoomProvider } from "@/../liveblocks.config";
import { Loader } from "lucide-react";

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

    console.log("Room component rendering with normalized roomId:", normalizedRoomId);

    // Get the current user from Convex
    const currentUser = useQuery(api.users.current);

    // Create proper LiveMap and LiveList objects
    // Important: We need to create these directly in the initialStorage prop
    // to ensure they're properly recognized by Liveblocks

    // If user data is still loading, show a loading indicator
    if (!currentUser) {
        return <div className="flex items-center justify-center h-full">Loading canvas...</div>;
    }

    // Verify we have a valid room ID
    if (!normalizedRoomId) {
        console.error("Invalid room ID provided to Room component");
        return <div className="flex items-center justify-center h-full">Error: Invalid room ID</div>;
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
                    penColor: { r: 0, g: 0, b: 0 } // Default to black
                }}
                initialStorage={{
                    layers: new LiveMap(),
                    layerIds: new LiveList([]),
                    lastUpdate: Date.now()
                }}

            >
                <ClientSideSuspense fallback={fallback || <div>
                    <Loader className="size-5 animate-spin" />
                </div>}>
                    {() => children}
                </ClientSideSuspense>
            </RoomProvider>
        </div>
    );
}