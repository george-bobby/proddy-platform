'use client';

import { useEffect, useRef, useCallback } from 'react';

import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useUpdateStatus } from '../api/use-update-status';
import { useMarkOfflineGlobally } from '../api/use-mark-offline-globally';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export const StatusTracker = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { updateStatus } = useUpdateStatus();
  const { markOfflineGlobally } = useMarkOfflineGlobally();
  const workspaceId = useWorkspaceId();
  const previousUserRef = useRef(user);
  const lastUpdateRef = useRef<number>(0);
  const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced status update to prevent race conditions
  const debouncedUpdateStatus = useCallback((status: string, workspaceId: string) => {
    const now = Date.now();

    // Clear any pending update
    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
    }

    // If we updated recently (within 5 seconds), debounce the update
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    if (timeSinceLastUpdate < 5000) {
      pendingUpdateRef.current = setTimeout(() => {
        updateStatus({ status, workspaceId: workspaceId as any }).catch(error => {
          console.error('Failed to update status:', error);
        });
        lastUpdateRef.current = Date.now();
      }, 2000); // Wait 2 seconds before updating
    } else {
      // Update immediately if enough time has passed
      updateStatus({ status, workspaceId: workspaceId as any }).catch(error => {
        console.error('Failed to update status:', error);
      });
      lastUpdateRef.current = now;
    }
  }, [updateStatus]);

  // Track authentication state changes
  useEffect(() => {
    const previousUser = previousUserRef.current;

    // If user was authenticated but is now null (logged out)
    if (previousUser && !user && !isLoading) {
      markOfflineGlobally().catch(error => {
        console.error('Failed to mark user offline on auth state change:', error);
      });
    }

    previousUserRef.current = user;
  }, [user, isLoading, markOfflineGlobally]);

  useEffect(() => {
    if (isLoading || !user || !workspaceId) return;

    // Set user as online when component mounts (debounced)
    debouncedUpdateStatus('online', workspaceId);

    // Set up interval to update status periodically (every 60 seconds instead of 30)
    const interval = setInterval(() => {
      debouncedUpdateStatus('online', workspaceId);
    }, 60000); // Increased from 30s to 60s to reduce frequency

    // Set user as offline when component unmounts
    return () => {
      clearInterval(interval);

      // Clear any pending debounced updates
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }

      // Immediate offline update (no debouncing for offline)
      updateStatus({ status: 'offline', workspaceId: workspaceId as any }).catch(error => {
        console.error('Failed to mark user offline:', error);
      });
    };
  }, [isLoading, user, workspaceId, debouncedUpdateStatus, updateStatus]);

  // This component doesn't render anything
  return null;
};
