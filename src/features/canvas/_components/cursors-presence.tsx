"use client";

import { shallow } from "@liveblocks/client";
import { memo, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { colorToCSS } from "../../../lib/utils";
import { Cursor } from "./cursor";
import { Path } from "./path";
import { useOthersConnectionIds, useOthersMapped, useOthers } from "../../../../liveblocks.config";
import { useWorkspaceId } from "../../../hooks/use-workspace-id";

const Cursors = () => {
  const ids = useOthersConnectionIds();

  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
};

const Drafts = () => {
  const workspaceId = useWorkspaceId();
  const members = useQuery(api.members.get, { workspaceId });

  // Create a map of Convex users by their ID for quick lookup
  const userMap = new Map();
  if (members) {
    console.log("Drafts - Available members:", members.map(m => ({
      id: m.user._id,
      name: m.user.name
    })));

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
    }),
    shallow,
  );

  return (
    <>
      {others.map(([key, other]) => {
        if (other && other.pencilDraft) {
          console.log("Rendering other user's pencil draft:", key, other);

          // Get real user name from Convex if available
          const defaultName = `${other.connectionId}`;
          const userId = other.info?.id;

          // Determine the user name
          let userName = other.info?.name || defaultName;

          // Try to find the user in the Convex database
          if (userId) {
            // Try exact match first
            if (userMap.has(userId)) {
              const member = userMap.get(userId);
              if (member && member.user.name) {
                userName = member.user.name;
                console.log("Found exact member match for draft by ID:", member.user.name);
              }
            } else {
              // Try partial match if userId is a string
              if (typeof userId === 'string') {
                // Find any member whose ID includes the userId or vice versa
                const matchingMember = Array.from(userMap.values()).find(member =>
                  member.user._id.includes(userId) || userId.includes(member.user._id)
                );

                if (matchingMember && matchingMember.user.name) {
                  userName = matchingMember.user.name;
                  console.log("Found partial member match for draft by ID:", matchingMember.user.name);
                }
              }
            }
          }

          // Calculate width based on name length
          // Use a more generous multiplier for longer names and ensure minimum width
          // "drawing..." text adds more width, so we need to account for that
          // Increase multiplier to ensure full names are visible
          const labelWidth = Math.max(userName.length * 12 + 80, 150); // Ensure minimum width

          return (
            <g key={key}>
              <Path
                x={0}
                y={0}
                points={other.pencilDraft}
                fill={other.penColor ? colorToCSS(other.penColor) : "#000"}
              />
              {/* Add a small label showing who is drawing */}
              {other.pencilDraft.length > 0 && (
                <foreignObject
                  x={other.pencilDraft[other.pencilDraft.length - 1][0]}
                  y={other.pencilDraft[other.pencilDraft.length - 1][1] - 20}
                  width={labelWidth}
                  height={20}
                >
                  <div className="bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {userName} drawing...
                  </div>
                </foreignObject>
              )}
            </g>
          );
        }

        return null;
      })}
    </>
  );
};

export const CursorsPresence = memo(() => {
  // Log all other users for debugging
  const others = useOthers();
  const workspaceId = useWorkspaceId();

  // Get members from Convex database
  const members = useQuery(api.members.get, { workspaceId });

  useEffect(() => {
    console.log("Other users in the room:", others.count);

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
      const userId = other.info?.id;

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

  return (
    <>
      <Drafts />
      <Cursors />
    </>
  );
});

CursorsPresence.displayName = "CursorsPresence";
