'use client';

import { useEffect, useRef } from 'react';

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

    // Set user as online when component mounts
    updateStatus({ status: 'online', workspaceId });

    // Set up interval to update status periodically (every 30 seconds)
    const interval = setInterval(() => {
      updateStatus({ status: 'online', workspaceId });
    }, 30000);

    // Set user as offline when component unmounts
    return () => {
      clearInterval(interval);
      updateStatus({ status: 'offline', workspaceId });
    };
  }, [isLoading, user, workspaceId, updateStatus]);

  // This component doesn't render anything
  return null;
};
