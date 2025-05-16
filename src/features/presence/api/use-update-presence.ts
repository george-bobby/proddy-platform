'use client';

import { useMutation } from 'convex/react';
import { useCallback, useEffect, useRef } from 'react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseUpdatePresenceProps {
  workspaceId: Id<'workspaces'>;
  channelId: Id<'channels'>;
}

export const useUpdatePresence = ({ workspaceId, channelId }: UseUpdatePresenceProps) => {
  const updatePresence = useMutation(api.presence.updatePresence);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const setActive = useCallback(async () => {
    try {
      await updatePresence({
        workspaceId,
        channelId,
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [workspaceId, channelId, updatePresence]);
  
  const setInactive = useCallback(async () => {
    try {
      await updatePresence({
        workspaceId,
        channelId,
        status: 'inactive',
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [workspaceId, channelId, updatePresence]);
  
  useEffect(() => {
    if (!workspaceId || !channelId) return;
    
    // Set user as active when component mounts
    setActive();
    
    // Set up interval to update presence periodically (every 60 seconds)
    intervalRef.current = setInterval(() => {
      setActive();
    }, 60000);
    
    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setActive();
      } else {
        setInactive();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set user as inactive when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setInactive();
    };
  }, [workspaceId, channelId, setActive, setInactive]);
  
  return {
    setActive,
    setInactive,
  };
};
