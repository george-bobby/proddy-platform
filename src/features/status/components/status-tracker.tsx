'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';

import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useUpdateStatus } from '../api/use-update-status';
import { useMarkOfflineGlobally } from '../api/use-mark-offline-globally';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { api } from '@/../convex/_generated/api';

export const StatusTracker = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { updateStatus } = useUpdateStatus();
  const { markOfflineGlobally } = useMarkOfflineGlobally();
  const workspaceId = useWorkspaceId();
  const previousUserRef = useRef(user);
  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has status tracking enabled
  const isStatusTrackingEnabled = useQuery(api.preferences.isStatusTrackingEnabled);

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

  // Smart update function that only updates if enough time has passed
  const smartUpdateStatus = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    // Only update if it's been more than 2 minutes since last update
    // This prevents unnecessary database calls
    if (timeSinceLastUpdate > 2 * 60 * 1000) {
      updateStatus({ status: 'online', workspaceId });
      lastUpdateRef.current = now;
    }
  }, [updateStatus, workspaceId]);

  // Handle user activity to reset the timer
  const handleUserActivity = useCallback(() => {
    smartUpdateStatus();
  }, [smartUpdateStatus]);

  useEffect(() => {
    if (isLoading || !user || !workspaceId || !isStatusTrackingEnabled) return;

    // Set user as online when component mounts
    updateStatus({ status: 'online', workspaceId });
    lastUpdateRef.current = Date.now();

    // Set up interval to update status periodically (every 5 minutes instead of 30 seconds)
    intervalRef.current = setInterval(() => {
      smartUpdateStatus();
    }, 5 * 60 * 1000); // 5 minutes

    // Add activity listeners to detect user interaction
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Throttle activity updates to prevent excessive calls
    let activityTimeout: NodeJS.Timeout | null = null;
    const throttledActivityHandler = () => {
      if (activityTimeout) return;

      activityTimeout = setTimeout(() => {
        handleUserActivity();
        activityTimeout = null;
      }, 30000); // Only update once every 30 seconds from user activity
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledActivityHandler, { passive: true });
    });

    // Handle visibility change for better accuracy
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        smartUpdateStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set user as offline when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }

      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledActivityHandler);
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      updateStatus({ status: 'offline', workspaceId });
    };
  }, [isLoading, user, workspaceId, updateStatus, smartUpdateStatus, handleUserActivity, isStatusTrackingEnabled]);

  // This component doesn't render anything
  return null;
};
