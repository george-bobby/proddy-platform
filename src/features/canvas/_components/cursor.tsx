"use client";

import { MousePointer2 } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { connectionIdToColor } from "../../../lib/utils";
import { useOther } from "../../../../liveblocks.config";
import { useWorkspaceId } from "../../../hooks/use-workspace-id";

// Types are defined in liveblocks.config.ts

type CursorProps = {
  connectionId: number;
};

export const Cursor = memo(({ connectionId }: CursorProps) => {
  const workspaceId = useWorkspaceId();
  const [userName, setUserName] = useState<string>(`${connectionId}`);

  // Use the real Liveblocks useOther hook to get cursor position and user info
  const other = useOther(connectionId, user => ({
    cursor: user.presence.cursor,
    info: user.info,
    id: user.id
  }));

  // Fetch members from Convex database
  const members = useQuery(api.members.get, { workspaceId });

  // Fetch current user to get their ID
  const currentUser = useQuery(api.users.current);

  // Update the user name whenever other or members changes
  useEffect(() => {
    // Skip if we don't have cursor data
    if (!other?.cursor) return;

    // Try to get user ID from Liveblocks info
    const userId = other?.id;

    console.log("Cursor user info:", {
      connectionId,
      userId,
      otherInfo: other.info,
      membersCount: members?.length || 0
    });

    // Determine the name to display
    let newUserName = `${connectionId}`; // Default fallback

    if (members) {
      // Log all members for debugging
      console.log("Available members:", members.map(m => ({
        id: m.user._id,
        name: m.user.name
      })));

      // First try to find the member by user ID from Liveblocks
      if (userId) {
        // Try to find an exact match first
        let member = members.find(m => m.user._id === userId);

        // If no exact match, try to find a partial match (in case of ID format differences)
        if (!member && typeof userId === 'string') {
          member = members.find(m =>
            m.user._id.includes(userId) ||
            (typeof userId === 'string' && userId.includes(m.user._id))
          );
        }

        if (member && member.user.name) {
          newUserName = member.user.name;
          console.log("Found real user name for cursor by ID:", member.user.name);
        } else {
          console.log("Could not find member with ID:", userId);

          // If we couldn't find by ID, try to match by connection ID
          // This is a fallback approach that might work in some cases
          if (members.length > 0) {
            // Use modulo to cycle through available members if needed
            const memberByIndex = members[connectionId % members.length];
            if (memberByIndex && memberByIndex.user.name) {
              newUserName = memberByIndex.user.name;
              console.log("Found user name for cursor by connection ID:", memberByIndex.user.name);
            }
          }
        }
      } else if (members.length > 0) {
        // If no userId but we have members, try connection ID approach
        const memberByIndex = members[connectionId % members.length];
        if (memberByIndex && memberByIndex.user.name) {
          newUserName = memberByIndex.user.name;
          console.log("Found user name for cursor by connection ID (no userId):", memberByIndex.user.name);
        }
      }

      // If we still don't have a name, use Liveblocks info if available
      if (newUserName === `${connectionId}` && other.info?.name) {
        newUserName = other.info.name;
        console.log("Using name from Liveblocks info:", other.info.name);
      }
    } else if (other.info?.name) {
      // No members but we have Liveblocks info
      newUserName = other.info.name;
      console.log("Using name from Liveblocks info (no members):", other.info.name);
    }

    // Only update the state if the name has changed
    // This helps prevent infinite loops
    if (newUserName !== userName) {
      setUserName(newUserName);
      console.log("Setting user name to:", newUserName);
    }
  }, [members, connectionId, other, currentUser, userName]);

  // If no cursor position is available, don't render anything
  if (!other?.cursor) return null;

  const { cursor, info } = other;
  const { x, y } = cursor;

  console.log("Cursor user info:", info, "Real name:", userName);

  // Calculate width based on name length to ensure it fits
  // Use a more generous multiplier for longer names and a minimum width for short names
  // Increase the multiplier to ensure full names are visible
  const nameWidth = Math.max(userName.length * 12, 60); // Ensure minimum width of 60px

  return (
    <foreignObject
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      height={50}
      width={nameWidth * 1.5} // Increase width to ensure full name is visible
      className="relative drop-shadow-md"
    >
      <MousePointer2
        className="h-5 w-5"
        style={{
          fill: connectionIdToColor(connectionId),
          color: connectionIdToColor(connectionId),
        }}
      />

      <div
        className="absolute left-5 px-2 py-0.5 rounded-md text-sm text-white font-semibold whitespace-nowrap"
        style={{
          backgroundColor: connectionIdToColor(connectionId),
          minWidth: `${nameWidth - 10}px`, // Ensure enough width for the name
          maxWidth: `${nameWidth * 1.5}px`, // Allow extra space for longer names
        }}
      >
        {userName}
      </div>
    </foreignObject>
  );
});

Cursor.displayName = "Cursor";
