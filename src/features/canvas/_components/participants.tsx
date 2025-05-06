"use client";

import { useChannelParticipants } from "../../../hooks/use-channel-participants";
import { connectionIdToColor } from "../../../lib/utils";
import { UserAvatar } from "./user-avatar";
import { useRoom } from "../../../../liveblocks.config";
import { useEffect } from "react";

// Define types for the Liveblocks user data
interface UserInfo {
  name?: string;
  picture?: string;
}

interface User {
  connectionId: number;
  memberId?: string;
  userId?: string;
  info?: UserInfo;
}

interface CurrentUser extends User {
  presence?: any;
}

// Constants
const MAX_SHOWN_OTHER_USERS = 2;

export const Participants = () => {
  // Fetch real participants from the database
  const { participants, currentParticipant, participantCount, isLoading } = useChannelParticipants();
  const room = useRoom();

  // Log participants for debugging
  useEffect(() => {
    console.log(`Participants component: ${participantCount} users in room ${room.id}`);
    console.log("Current participants:", participants);
    console.log("Current user:", currentParticipant);
  }, [participants, currentParticipant, participantCount, room.id]);

  // If still loading, show nothing
  if (isLoading) return null;

  const hasMoreUsers = participants.length > MAX_SHOWN_OTHER_USERS;

  return (
    <div className="absolute h-12 top-32 right-2 bg-white rounded-md p-3 flex items-center shadow-md z-50">
      <div className="flex items-center">
        {participantCount > 0 && (
          <span className="text-sm font-medium mr-2">
            {participantCount} active
          </span>
        )}
        <div className="flex gap-x-2">
          {participants.slice(0, MAX_SHOWN_OTHER_USERS).map((user) => {
            // Log the user info for debugging
            console.log("Rendering participant:", user.info?.name, user);

            return (
              <UserAvatar
                borderColor={connectionIdToColor(user.connectionId)}
                key={user.connectionId}
                src={user.info?.picture}
                name={user.info?.name}
                fallback={user.info?.name?.[0] || "U"}
              />
            );
          })}

          {currentParticipant && (
            <UserAvatar
              borderColor={connectionIdToColor(currentParticipant.connectionId)}
              src={currentParticipant.info?.picture}
              name={`${currentParticipant.info?.name} (You)`}
              fallback={currentParticipant.info?.name?.[0] || "Y"}
            />
          )}

          {hasMoreUsers && (
            <UserAvatar
              name={`${participants.length - MAX_SHOWN_OTHER_USERS} more`}
              fallback={`+${participants.length - MAX_SHOWN_OTHER_USERS}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const ParticipantsSkeleton = () => {
  return (
    <div
      className="w-[100px] absolute h-12 top-32 right-2 bg-white rounded-md p-3 flex items-center shadow-md z-50"
      aria-hidden
    />
  );
};
