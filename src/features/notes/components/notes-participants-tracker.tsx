"use client";

import { useEffect } from "react";
import { useOthers, useSelf } from "@/../liveblocks.config";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

interface NotesParticipantsTrackerProps {
  roomId: string;
  noteId: Id<"notes">;
  currentUserId?: string;
  onParticipantsChange?: (participantIds: string[]) => void;
}

export const NotesParticipantsTracker = ({
  roomId,
  noteId,
  currentUserId,
  onParticipantsChange
}: NotesParticipantsTrackerProps) => {
  // Get Liveblocks participants
  const others = useOthers();
  const self = useSelf();

  // Effect to track participants
  useEffect(() => {
    if (!roomId) return;

    // Get all participant IDs
    const participantIds: string[] = [];

    // Add other users
    others.forEach(other => {
      if (other.id) {
        participantIds.push(other.id);
      }
    });

    // Add current user
    if (self?.id) {
      participantIds.push(self.id);
    } else if (currentUserId) {
      participantIds.push(currentUserId);
    }

    // Call the onParticipantsChange callback if provided
    if (onParticipantsChange) {
      onParticipantsChange(participantIds);
    }

    console.log(`NotesParticipantsTracker: ${participantIds.length} users in note ${noteId}`);
  }, [others, self, roomId, noteId, currentUserId, onParticipantsChange]);

  // This component doesn't render anything
  return null;
};
