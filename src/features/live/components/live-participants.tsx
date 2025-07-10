"use client";

import { useChannelParticipants } from "@/hooks/use-channel-participants";
import { connectionIdToColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hint } from "@/components/hint";
import { useRoom } from "@/../liveblocks.config";
import { useEffect } from "react";

// Constants
const MAX_SHOWN_OTHER_USERS = 3;

interface LiveParticipantsProps {
  variant?: 'canvas' | 'notes';
  isFullScreen?: boolean;
  className?: string;
}

export const LiveParticipants = ({
  variant = 'canvas',
  isFullScreen = false,
  className
}: LiveParticipantsProps) => {
  // Fetch real participants from the database
  const { participants, currentParticipant, participantCount, isLoading } = useChannelParticipants();
  const room = useRoom();

  // If still loading, show nothing
  if (isLoading) return null;

  const hasMoreUsers = participants.length > MAX_SHOWN_OTHER_USERS;

  // Use canvas-style display for both variants when inside LiveHeader
  // This ensures consistent appearance and uses Liveblocks connection colors
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {participants.slice(0, MAX_SHOWN_OTHER_USERS).map((user) => (
        <Hint key={user.connectionId} label={user.info.name} side="bottom">
          <div
            className="relative"
            style={{
              borderColor: connectionIdToColor(user.connectionId),
            }}
          >
            <Avatar className="h-7 w-7 border-2" style={{ borderColor: connectionIdToColor(user.connectionId) }}>
              <AvatarImage src={user.info.picture} />
              <AvatarFallback className="text-xs font-semibold">
                {user.info.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </Hint>
      ))}

      {currentParticipant && (
        <Hint label={`${currentParticipant.info.name} (You)`} side="bottom">
          <div
            className="relative"
            style={{
              borderColor: connectionIdToColor(currentParticipant.connectionId),
            }}
          >
            <Avatar className="h-7 w-7 border-2" style={{ borderColor: connectionIdToColor(currentParticipant.connectionId) }}>
              <AvatarImage src={currentParticipant.info.picture} />
              <AvatarFallback className="text-xs font-semibold">
                {currentParticipant.info.name?.[0] || "Y"}
              </AvatarFallback>
            </Avatar>
          </div>
        </Hint>
      )}

      {hasMoreUsers && (
        <Hint label={`${participants.length - MAX_SHOWN_OTHER_USERS} more`} side="bottom">
          <div className="relative">
            <Avatar className="h-7 w-7 border-2 border-gray-300">
              <AvatarFallback className="text-xs font-semibold bg-gray-100">
                +{participants.length - MAX_SHOWN_OTHER_USERS}
              </AvatarFallback>
            </Avatar>
          </div>
        </Hint>
      )}
    </div>
  );
};
