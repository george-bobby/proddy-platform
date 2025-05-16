"use client";

import { useChannelParticipants } from "@/hooks/use-channel-participants";
import { connectionIdToColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hint } from "@/components/hint";
import { useRoom } from "@/../liveblocks.config";
import { useEffect } from "react";

// Constants
const MAX_SHOWN_OTHER_USERS = 3;

interface NotesParticipantsProps {
  className?: string;
}

export const NotesParticipants = ({ className }: NotesParticipantsProps) => {
  // Fetch real participants from the database
  const { participants, currentParticipant, participantCount, isLoading } = useChannelParticipants();
  const room = useRoom();

  // Log participants for debugging
  useEffect(() => {
    console.log(`NotesParticipants component: ${participantCount} users in room ${room.id}`);
    console.log("Current participants:", participants);
    console.log("Current user:", currentParticipant);
  }, [participants, currentParticipant, participantCount, room.id]);

  // If still loading, show nothing
  if (isLoading) return null;

  const hasMoreUsers = participants.length > MAX_SHOWN_OTHER_USERS;

  return (
    <div className={`flex items-center gap-2 bg-white rounded-md p-2 shadow-sm ${className}`}>
      <div className="flex items-center">
        {participantCount > 0 && (
          <span className="text-xs font-medium mr-2 text-muted-foreground">
            {participantCount} {participantCount === 1 ? 'user' : 'users'}
          </span>
        )}
        <div className="flex gap-x-1">
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
            <Hint label={`${participants.length - MAX_SHOWN_OTHER_USERS} more users`} side="bottom">
              <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                +{participants.length - MAX_SHOWN_OTHER_USERS}
              </div>
            </Hint>
          )}
        </div>
      </div>
    </div>
  );
};
