"use client";

import { shallow } from "@liveblocks/client";
import { memo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { colorToCSS } from "@/lib/utils";
import { LiveCursor } from "./live-cursor";
import { Path } from "@/features/canvas/components/path";
import { useOthersConnectionIds, useOthersMapped, useOthers } from "@/../liveblocks.config";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

type LiveCursorsPresenceProps = {
  variant?: 'canvas' | 'notes';
  showDrawingPaths?: boolean;
};

const Cursors = ({ variant }: { variant: 'canvas' | 'notes' }) => {
  const ids = useOthersConnectionIds();

  return (
    <>
      {ids.map((connectionId) => (
        <LiveCursor 
          key={connectionId} 
          connectionId={connectionId} 
          variant={variant}
        />
      ))}
    </>
  );
};

const DrawingPaths = () => {
  const workspaceId = useWorkspaceId();
  const members = useQuery(api.members.get, { workspaceId });

  // Create a map of Convex users by their ID for quick lookup
  const userMap = new Map();
  if (members) {
    members.forEach(member => {
      userMap.set(member.user._id, member);
    });
  }

  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
      info: other.info,
      connectionId: other.connectionId,
      id: other.id
    }),
    shallow,
  );

  return (
    <>
      {others.map(([key, other]) => {
        if (other && other.pencilDraft) {
          // Get real user name from Convex if available
          const defaultName = `${other.connectionId}`;
          const userId = other.id;

          // Determine the user name
          let userName = other.info?.name || defaultName;

          if (members && userId) {
            const memberByUserId = members.find(m => m.user._id === userId);
            if (memberByUserId && memberByUserId.user.name) {
              userName = memberByUserId.user.name;
            }
          }

          return (
            <g key={key}>
              <Path
                x={0}
                y={0}
                points={other.pencilDraft}
                fill={other.penColor ? colorToCSS(other.penColor) : "#000"}
              />
            </g>
          );
        }

        return null;
      })}
    </>
  );
};

export const LiveCursorsPresence = memo(({ 
  variant = 'canvas', 
  showDrawingPaths = true 
}: LiveCursorsPresenceProps) => {
  // Log all other users for debugging
  const others = useOthers();
  const workspaceId = useWorkspaceId();

  // Get members from Convex database
  const members = useQuery(api.members.get, { workspaceId });

  useEffect(() => {
    // Create a map of Convex users by their ID for quick lookup
    const userMap = new Map();
    if (members) {
      members.forEach(member => {
        userMap.set(member.user._id, member);
      });
    }

    others.forEach(other => {
      // Try to find the real user name from Convex
      const defaultName = `${other.connectionId}`;
      let realName = other.info?.name || defaultName;
      const userId = other.id;

      if (members && userId) {
        const memberByUserId = members.find(m => m.user._id === userId);
        if (memberByUserId && memberByUserId.user.name) {
          realName = memberByUserId.user.name;
        }
      }

      console.log(
        `${variant} - User:`, other.connectionId,
        "Real name:", realName,
        "Liveblocks info:", other.info
      );
    });
  }, [others, members, variant]);

  return (
    <>
      {variant === 'canvas' && showDrawingPaths && <DrawingPaths />}
      <Cursors variant={variant} />
    </>
  );
});

LiveCursorsPresence.displayName = "LiveCursorsPresence";
