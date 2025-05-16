"use client";

import { shallow } from "@liveblocks/client";
import { memo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useOthersConnectionIds, useOthersMapped, useOthers } from "@/../liveblocks.config";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { NotesCursor } from "./notes-cursor";

const NotesCursors = () => {
  const ids = useOthersConnectionIds();

  return (
    <>
      {ids.map((connectionId) => (
        <NotesCursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
};

export const NotesCursorsPresence = memo(() => {
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

      if (userId) {
        // Try exact match first
        if (userMap.has(userId)) {
          const member = userMap.get(userId);
          if (member && member.user.name) {
            realName = member.user.name;
            console.log("Found exact member match by ID:", member.user.name);
          }
        } else {
          // Try partial match if userId is a string
          if (typeof userId === 'string') {
            // Find any member whose ID includes the userId or vice versa
            const matchingMember = Array.from(userMap.values()).find(member =>
              member.user._id.includes(userId) || userId.includes(member.user._id)
            );

            if (matchingMember && matchingMember.user.name) {
              realName = matchingMember.user.name;
              console.log("Found partial member match by ID:", matchingMember.user.name);
            }
          }
        }
      }

      console.log(
        "User:", other.connectionId,
        "Real name:", realName,
        "Liveblocks info:", other.info
      );
    });
  }, [others, members]);

  return <NotesCursors />;
});

NotesCursorsPresence.displayName = "NotesCursorsPresence";
