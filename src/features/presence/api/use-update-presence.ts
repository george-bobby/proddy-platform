'use client';

import { useMutation } from 'convex/react';
import { useCallback, useEffect, useRef } from 'react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseUpdatePresenceProps {
	workspaceId: Id<'workspaces'>;
	channelId: Id<'channels'>;
}

export const useUpdatePresence = ({
	workspaceId,
	channelId,
}: UseUpdatePresenceProps) => {
	const updatePresence = useMutation(api.presence.updatePresence);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const lastUpdateRef = useRef<number>(0);
	const pendingUpdateRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced presence update to prevent race conditions
	const debouncedUpdatePresence = useCallback(
		async (status: 'active' | 'inactive') => {
			const now = Date.now();

			// Clear any pending update
			if (pendingUpdateRef.current) {
				clearTimeout(pendingUpdateRef.current);
			}

			// If we updated recently (within 3 seconds), debounce the update
			const timeSinceLastUpdate = now - lastUpdateRef.current;
			if (timeSinceLastUpdate < 3000 && status === 'active') {
				pendingUpdateRef.current = setTimeout(() => {
					updatePresence({
						workspaceId: workspaceId as any,
						channelId: channelId as any,
						status,
					}).catch((error) => {
						console.error('Failed to update presence:', error);
					});
					lastUpdateRef.current = Date.now();
				}, 1500); // Wait 1.5 seconds before updating
			} else {
				// Update immediately if enough time has passed or if going inactive
				try {
					await updatePresence({
						workspaceId: workspaceId as any,
						channelId: channelId as any,
						status,
					});
					lastUpdateRef.current = now;
				} catch (error) {
					console.error('Failed to update presence:', error);
				}
			}
		},
		[workspaceId, channelId, updatePresence]
	);

	const setActive = useCallback(async () => {
		await debouncedUpdatePresence('active');
	}, [debouncedUpdatePresence]);

	const setInactive = useCallback(async () => {
		// Clear any pending updates when going inactive
		if (pendingUpdateRef.current) {
			clearTimeout(pendingUpdateRef.current);
		}
		await debouncedUpdatePresence('inactive');
	}, [debouncedUpdatePresence]);

	useEffect(() => {
		if (!workspaceId || !channelId) return;

		// Set user as active when component mounts
		setActive();

		// Set up interval to update presence periodically (every 90 seconds instead of 60)
		intervalRef.current = setInterval(() => {
			setActive();
		}, 90000); // Increased from 60s to 90s to reduce frequency

		// Handle visibility change with debouncing
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

			// Clear any pending debounced updates
			if (pendingUpdateRef.current) {
				clearTimeout(pendingUpdateRef.current);
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
