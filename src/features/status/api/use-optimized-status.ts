import { useQuery } from 'convex/react';
import { useMemo } from 'react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseOptimizedStatusProps {
	workspaceId: Id<'workspaces'>;
	userId?: Id<'users'>;
}

export const useOptimizedStatus = ({
	workspaceId,
	userId,
}: UseOptimizedStatusProps) => {
	// Get user's status tracking preference
	const isStatusTrackingEnabled = useQuery(
		api.preferences.isStatusTrackingEnabled
	);

	// Get status data (this will be null if status tracking is disabled)
	const statusData = useQuery(
		api.status.getUserStatus,
		userId && isStatusTrackingEnabled ? { workspaceId, userId } : 'skip'
	);

	// Get workspace-wide status list
	const workspaceStatuses = useQuery(
		api.status.getForWorkspace,
		isStatusTrackingEnabled ? { workspaceId } : 'skip'
	);

	const result = useMemo(() => {
		// If status tracking is disabled, return privacy status
		if (!isStatusTrackingEnabled) {
			return {
				status: 'privacy' as const,
				lastSeen: 0,
				isOnline: false,
				isStatusTrackingEnabled: false,
				workspaceStatuses: [],
			};
		}

		const isOnline = statusData?.status === 'online';

		return {
			status: statusData?.status || 'offline',
			lastSeen: statusData?.lastSeen || 0,
			isOnline,
			isStatusTrackingEnabled: true,
			workspaceStatuses: workspaceStatuses || [],
		};
	}, [statusData, workspaceStatuses, isStatusTrackingEnabled]);

	return {
		...result,
		isLoading:
			isStatusTrackingEnabled === undefined ||
			(isStatusTrackingEnabled && statusData === undefined),
	};
};

// Hook for getting multiple user statuses efficiently
export const useMultipleUserStatuses = (
	workspaceId: Id<'workspaces'>,
	userIds: Id<'users'>[]
) => {
	const isStatusTrackingEnabled = useQuery(
		api.preferences.isStatusTrackingEnabled
	);
	const workspaceStatuses = useQuery(
		api.status.getForWorkspace,
		isStatusTrackingEnabled ? { workspaceId } : 'skip'
	);

	const statusMap = useMemo(() => {
		if (!isStatusTrackingEnabled || !workspaceStatuses) {
			// Return privacy status for all users if tracking is disabled
			return userIds.reduce(
				(acc, userId) => {
					acc[userId] = {
						status: 'privacy' as const,
						lastSeen: 0,
						isOnline: false,
					};
					return acc;
				},
				{} as Record<
					string,
					{ status: string; lastSeen: number; isOnline: boolean }
				>
			);
		}

		// Create a map of user statuses
		const statusLookup = workspaceStatuses.reduce(
			(acc, status) => {
				acc[status.userId] = status;
				return acc;
			},
			{} as Record<string, (typeof workspaceStatuses)[0]>
		);

		// Map requested user IDs to their status
		return userIds.reduce(
			(acc, userId) => {
				const userStatus = statusLookup[userId];
				acc[userId] = {
					status: userStatus?.status || 'offline',
					lastSeen: userStatus?.lastSeen || 0,
					isOnline: userStatus?.status === 'online',
				};
				return acc;
			},
			{} as Record<
				string,
				{ status: string; lastSeen: number; isOnline: boolean }
			>
		);
	}, [workspaceStatuses, userIds, isStatusTrackingEnabled]);

	return {
		statusMap,
		isStatusTrackingEnabled: isStatusTrackingEnabled ?? true,
		isLoading:
			isStatusTrackingEnabled === undefined ||
			(isStatusTrackingEnabled && workspaceStatuses === undefined),
	};
};

// Hook for workspace-wide status summary
export const useWorkspaceStatusSummary = (workspaceId: Id<'workspaces'>) => {
	const isStatusTrackingEnabled = useQuery(
		api.preferences.isStatusTrackingEnabled
	);
	const workspaceStatuses = useQuery(
		api.status.getForWorkspace,
		isStatusTrackingEnabled ? { workspaceId } : 'skip'
	);

	const summary = useMemo(() => {
		if (!isStatusTrackingEnabled || !workspaceStatuses) {
			return {
				totalUsers: 0,
				onlineUsers: 0,
				recentlyOnlineUsers: 0,
				offlineUsers: 0,
				privacyUsers: 0,
				onlinePercentage: 0,
			};
		}

		const onlineCount = workspaceStatuses.filter(
			(s) => s.status === 'online'
		).length;
		const recentlyOnlineCount = workspaceStatuses.filter(
			(s) => s.status === 'recently_online'
		).length;
		const offlineCount = workspaceStatuses.filter(
			(s) => s.status === 'offline'
		).length;
		const privacyCount = workspaceStatuses.filter(
			(s) => s.status === 'privacy'
		).length;
		const totalCount = workspaceStatuses.length;

		return {
			totalUsers: totalCount,
			onlineUsers: onlineCount,
			recentlyOnlineUsers: recentlyOnlineCount,
			offlineUsers: offlineCount,
			privacyUsers: privacyCount,
			onlinePercentage:
				totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0,
		};
	}, [workspaceStatuses, isStatusTrackingEnabled]);

	return {
		...summary,
		isStatusTrackingEnabled: isStatusTrackingEnabled ?? true,
		isLoading:
			isStatusTrackingEnabled === undefined ||
			(isStatusTrackingEnabled && workspaceStatuses === undefined),
	};
};
