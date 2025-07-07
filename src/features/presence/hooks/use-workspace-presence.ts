'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import usePresence from '@convex-dev/presence/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

interface UseWorkspacePresenceProps {
  workspaceId: Id<'workspaces'>;
}

export const useWorkspacePresence = ({ workspaceId }: UseWorkspacePresenceProps) => {
  const [userName] = useState(() => `User-${Math.floor(Math.random() * 10000)}`);
  
  // Get current user to use their actual name
  const currentUser = useQuery(api.users.current);
  const actualUserName = currentUser?.name || userName;
  
  // Use the Convex presence hook for workspace-level presence
  const presenceState = usePresence(
    api.presence, 
    `workspace-${workspaceId}`, 
    actualUserName
  );

  // Get members data to enrich presence information
  const members = useQuery(api.members.get, { workspaceId });

  // Combine presence data with member information
  const enrichedPresence = presenceState?.map(presence => {
    const member = members?.find(m => m.userId === presence.userId);
    return {
      ...presence,
      user: member?.user || {
        name: presence.data || actualUserName,
        image: undefined
      },
      memberId: member?._id
    };
  }) || [];

  return {
    presenceState: enrichedPresence,
    isOnline: (presenceState?.length || 0) > 0,
    onlineCount: presenceState?.length || 0
  };
};

export const useUserPresence = (userId: string) => {
  const presenceData = useQuery(api.presence.listUserPresence, { userId });
  
  return {
    isOnline: (presenceData?.length || 0) > 0,
    rooms: presenceData || []
  };
};
