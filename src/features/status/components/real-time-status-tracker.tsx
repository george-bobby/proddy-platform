'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';

import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { useUpdateStatus } from '../api/use-update-status';
import { useMarkOfflineGlobally } from '../api/use-mark-offline-globally';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { api } from '@/../convex/_generated/api';

export const RealTimeStatusTracker = () => {
	const { data: user, isLoading } = useCurrentUser();
	const { updateStatus } = useUpdateStatus();
	const { markOfflineGlobally } = useMarkOfflineGlobally();
	const workspaceId = useWorkspaceId();
	const previousUserRef = useRef(user);
	const lastActivityRef = useRef<number>(Date.now());
	const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Check if user has status tracking enabled
	const isStatusTrackingEnabled = useQuery(api.userPreferences.isStatusTrackingEnabled);

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

	// Smart update function that only updates when necessary
	const updateUserActivity = useCallback(() => {
		if (!user || !workspaceId || !isStatusTrackingEnabled) return;

		const now = Date.now();
		lastActivityRef.current = now;

		// Update status to online
		updateStatus({ status: 'online', workspaceId });
	}, [user, workspaceId, isStatusTrackingEnabled, updateStatus]);

	// Handle user activity events
	const handleUserActivity = useCallback(() => {
		updateUserActivity();
	}, [updateUserActivity]);

	// Heartbeat function to maintain online status
	const heartbeat = useCallback(() => {
		if (!user || !workspaceId || !isStatusTrackingEnabled) return;

		const now = Date.now();
		const timeSinceLastActivity = now - lastActivityRef.current;

		// If user has been inactive for more than 5 minutes, don't send heartbeat
		if (timeSinceLastActivity > 5 * 60 * 1000) {
			return;
		}

		// Send heartbeat to maintain online status
		updateStatus({ status: 'online', workspaceId });
	}, [user, workspaceId, isStatusTrackingEnabled, updateStatus]);

	useEffect(() => {
		if (isLoading || !user || !workspaceId || !isStatusTrackingEnabled) return;

		// Set user as online when component mounts
		updateUserActivity();

		// Set up heartbeat interval (every 2 minutes)
		heartbeatIntervalRef.current = setInterval(heartbeat, 2 * 60 * 1000);

		// Activity events to track user interaction
		const activityEvents = [
			'mousedown',
			'mousemove', 
			'keypress',
			'scroll',
			'touchstart',
			'click',
			'focus'
		];

		// Throttle activity updates to prevent excessive calls
		let activityTimeout: NodeJS.Timeout | null = null;
		const throttledActivityHandler = () => {
			if (activityTimeout) return;
			
			activityTimeout = setTimeout(() => {
				handleUserActivity();
				activityTimeout = null;
			}, 30000); // Only update once every 30 seconds from user activity
		};

		// Add activity listeners
		activityEvents.forEach(event => {
			document.addEventListener(event, throttledActivityHandler, { passive: true });
		});

		// Handle visibility change for better accuracy
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				updateUserActivity();
			} else {
				// When tab becomes hidden, we don't immediately mark as offline
				// Let the heartbeat system handle it naturally
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Handle page unload to mark user as offline
		const handleBeforeUnload = () => {
			// Use navigator.sendBeacon for reliable offline status update
			if (navigator.sendBeacon) {
				const data = JSON.stringify({
					workspaceId,
					status: 'offline'
				});
				navigator.sendBeacon('/api/status/offline', data);
			} else {
				// Fallback for browsers that don't support sendBeacon
				updateStatus({ status: 'offline', workspaceId });
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		// Cleanup function
		return () => {
			if (heartbeatIntervalRef.current) {
				clearInterval(heartbeatIntervalRef.current);
			}
			
			if (activityTimeout) {
				clearTimeout(activityTimeout);
			}

			// Remove event listeners
			activityEvents.forEach(event => {
				document.removeEventListener(event, throttledActivityHandler);
			});
			
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('beforeunload', handleBeforeUnload);
			
			// Mark user as offline when component unmounts
			updateStatus({ status: 'offline', workspaceId });
		};
	}, [
		isLoading, 
		user, 
		workspaceId, 
		isStatusTrackingEnabled, 
		updateUserActivity, 
		handleUserActivity, 
		heartbeat, 
		updateStatus
	]);

	// This component doesn't render anything
	return null;
};
