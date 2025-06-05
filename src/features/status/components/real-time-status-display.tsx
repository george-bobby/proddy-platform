'use client';

import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { StatusIndicator } from '@/components/status-indicator';
import { cn } from '@/lib/utils';

interface RealTimeStatusDisplayProps {
	userId: Id<'users'>;
	workspaceId: Id<'workspaces'>;
	showText?: boolean;
	className?: string;
}

export const RealTimeStatusDisplay = ({
	userId,
	workspaceId,
	showText = false,
	className
}: RealTimeStatusDisplayProps) => {
	// This will automatically update in real-time thanks to Convex reactivity
	const statusData = useQuery(api.status.getUserStatus, {
		workspaceId,
		userId,
	});

	if (!statusData) {
		return (
			<div className={cn('flex items-center gap-2', className)}>
				<StatusIndicator status="offline" />
				{showText && <span className="text-sm text-muted-foreground">Offline</span>}
			</div>
		);
	}

	const getStatusText = () => {
		const lastSeenText = statusData.lastSeen
			? formatDistanceToNow(new Date(statusData.lastSeen), { addSuffix: true })
			: 'Never';

		switch (statusData.status) {
			case 'online':
				return 'Online now';
			case 'recently_online':
				return `Recently online • Last seen ${lastSeenText}`;
			case 'privacy':
				return 'Status hidden';
			case 'offline':
			default:
				return `Last seen ${lastSeenText}`;
		}
	};

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<StatusIndicator status={statusData.status as 'online' | 'offline' | 'recently_online' | 'privacy'} />
			{showText && (
				<span className="text-sm text-muted-foreground">
					{getStatusText()}
				</span>
			)}
		</div>
	);
};

interface WorkspaceStatusListProps {
	workspaceId: Id<'workspaces'>;
	className?: string;
}

export const WorkspaceStatusList = ({ workspaceId, className }: WorkspaceStatusListProps) => {
	// This will automatically update in real-time for all users in the workspace
	const statusList = useQuery(api.status.getForWorkspace, { workspaceId });

	if (!statusList || statusList.length === 0) {
		return (
			<div className={cn('text-sm text-muted-foreground', className)}>
				No status information available
			</div>
		);
	}

	const onlineUsers = statusList.filter(s => s.status === 'online');
	const recentlyOnlineUsers = statusList.filter(s => s.status === 'recently_online');
	const offlineUsers = statusList.filter(s => s.status === 'offline');
	const privacyUsers = statusList.filter(s => s.status === 'privacy');

	return (
		<div className={cn('space-y-2', className)}>
			{onlineUsers.length > 0 && (
				<div>
					<h4 className="text-sm font-medium text-green-600 mb-1">
						Online ({onlineUsers.length})
					</h4>
					<div className="space-y-1">
						{onlineUsers.map((status) => (
							<div key={status.userId} className="flex items-center gap-2 text-sm">
								<StatusIndicator status="online" />
								<span>User {status.userId}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{recentlyOnlineUsers.length > 0 && (
				<div>
					<h4 className="text-sm font-medium text-gray-500 mb-1">
						Recently Online ({recentlyOnlineUsers.length})
					</h4>
					<div className="space-y-1">
						{recentlyOnlineUsers.map((status) => (
							<div key={status.userId} className="flex items-center gap-2 text-sm">
								<StatusIndicator status="recently_online" />
								<span className="text-muted-foreground">
									User {status.userId} • Last seen {formatDistanceToNow(new Date(status.lastSeen), { addSuffix: true })}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{offlineUsers.length > 0 && (
				<div>
					<h4 className="text-sm font-medium text-red-600 mb-1">
						Offline ({offlineUsers.length})
					</h4>
					<div className="space-y-1">
						{offlineUsers.map((status) => (
							<div key={status.userId} className="flex items-center gap-2 text-sm">
								<StatusIndicator status="offline" />
								<span className="text-muted-foreground">
									User {status.userId} • Last seen {formatDistanceToNow(new Date(status.lastSeen), { addSuffix: true })}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{privacyUsers.length > 0 && (
				<div>
					<h4 className="text-sm font-medium text-gray-400 mb-1">
						Status Hidden ({privacyUsers.length})
					</h4>
					<div className="space-y-1">
						{privacyUsers.map((status) => (
							<div key={status.userId} className="flex items-center gap-2 text-sm">
								<StatusIndicator status="privacy" />
								<span className="text-muted-foreground">
									User {status.userId} • Status hidden
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
