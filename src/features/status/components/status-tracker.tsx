'use client';

import { useEffect } from 'react';

import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useUpdateStatus } from '../api/use-update-status';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export const StatusTracker = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { updateStatus } = useUpdateStatus();
  const workspaceId = useWorkspaceId();

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
