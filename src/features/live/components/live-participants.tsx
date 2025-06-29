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

  // Log participants for debugging
  useEffect(() => {
    console.log(`LiveParticipants (${variant}): ${participantCount} users in room ${room.id}`);
    console.log("Current participants:", participants);
    console.log("Current user:", currentParticipant);
  }, [participants, currentParticipant, participantCount, room.id, variant]);

  // If still loading, show nothing
  if (isLoading) return null;

  const hasMoreUsers = participants.length > MAX_SHOWN_OTHER_USERS;

  // Canvas variant (original styling)
  if (variant === 'canvas') {
    return (
      <div className={`absolute top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md ${isFullScreen ? 'z-50' : ''} ${className}`}>
        <div className="flex gap-x-2">
          {participants.slice(0, MAX_SHOWN_OTHER_USERS).map((user) => (
            <Hint key={user.connectionId} label={user.info.name} side="bottom">
              <div
                className="relative"
                style={{
                  borderColor: connectionIdToColor(user.connectionId),
                }}
              >
                <Avatar className="h-8 w-8 border-2" style={{ borderColor: connectionIdToColor(user.connectionId) }}>
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
                <Avatar className="h-8 w-8 border-2" style={{ borderColor: connectionIdToColor(currentParticipant.connectionId) }}>
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
                <Avatar className="h-8 w-8 border-2 border-gray-300">
                  <AvatarFallback className="text-xs font-semibold bg-gray-100">
                    +{participants.length - MAX_SHOWN_OTHER_USERS}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Hint>
          )}
        </div>
      </div>
    );
  }

  // Notes variant - check if absolute positioning is requested via className
  const isAbsolutePositioned = className?.includes('absolute');

  if (isAbsolutePositioned) {
    // Absolute positioned notes variant (similar to canvas)
    return (
      <div className={`bg-white rounded-md p-2 flex items-center shadow-md ${className}`}>
        <div className="flex gap-x-1">
          {participants.slice(0, MAX_SHOWN_OTHER_USERS).map((user) => (
            <Hint key={user.connectionId} label={user.info.name} side="bottom">
              <div
                className="relative"
                style={{
                  borderColor: connectionIdToColor(user.connectionId),
                }}
              >
                <Avatar className="h-6 w-6 border-2" style={{ borderColor: connectionIdToColor(user.connectionId) }}>
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
                <Avatar className="h-6 w-6 border-2" style={{ borderColor: connectionIdToColor(currentParticipant.connectionId) }}>
                  <AvatarImage src={currentParticipant.info.picture} />
                  <AvatarFallback className="text-xs font-semibold">
                    {currentParticipant.info.name?.[0] || "Y"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Hint>
          )}

          {participants.length > MAX_SHOWN_OTHER_USERS && (
            <Hint label={`+${participants.length - MAX_SHOWN_OTHER_USERS} more`} side="bottom">
              <div className="relative">
                <Avatar className="h-6 w-6 border-2 border-gray-300">
                  <AvatarFallback className="text-xs font-semibold bg-gray-100">
                    +{participants.length - MAX_SHOWN_OTHER_USERS}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Hint>
          )}
        </div>
      </div>
    );
  }

  // Notes variant (compact styling for inline use)
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {participants.slice(0, MAX_SHOWN_OTHER_USERS).map((user) => (
        <Hint key={user.connectionId} label={user.info.name} side="bottom">
          <Avatar className="h-6 w-6 border-2 border-primary/20">
            <AvatarImage src={user.info.picture} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {user.info.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Hint>
      ))}

      {currentParticipant && (
        <Hint label={`${currentParticipant.info.name} (You)`} side="bottom">
          <Avatar className="h-6 w-6 border-2 border-primary">
            <AvatarImage src={currentParticipant.info.picture} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {currentParticipant.info.name?.[0] || "Y"}
            </AvatarFallback>
          </Avatar>
        </Hint>
      )}

      {hasMoreUsers && (
        <Hint label={`${participants.length - MAX_SHOWN_OTHER_USERS} more`} side="bottom">
          <Avatar className="h-6 w-6 border-2 border-gray-300">
            <AvatarFallback className="text-xs font-semibold bg-gray-100">
              +{participants.length - MAX_SHOWN_OTHER_USERS}
            </AvatarFallback>
          </Avatar>
        </Hint>
      )}
    </div>
  );
};
