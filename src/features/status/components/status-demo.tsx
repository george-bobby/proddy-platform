'use client';

import { StatusIndicator } from '@/components/status-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const StatusDemo = () => {
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Status Indicators</CardTitle>
				<CardDescription>
					Four different status states for user presence tracking
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-8 h-8 bg-gray-200 rounded-full" />
						<StatusIndicator status="online" />
					</div>
					<div>
						<p className="font-medium">Online</p>
						<p className="text-sm text-muted-foreground">User is currently active</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-8 h-8 bg-gray-200 rounded-full" />
						<StatusIndicator status="recently_online" />
					</div>
					<div>
						<p className="font-medium">Recently Online</p>
						<p className="text-sm text-muted-foreground">User was active 2-5 minutes ago</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-8 h-8 bg-gray-200 rounded-full" />
						<StatusIndicator status="offline" />
					</div>
					<div>
						<p className="font-medium">Offline</p>
						<p className="text-sm text-muted-foreground">User is offline or inactive for 5+ minutes</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-8 h-8 bg-gray-200 rounded-full" />
						<StatusIndicator status="privacy" />
					</div>
					<div>
						<p className="font-medium">Status Hidden</p>
						<p className="text-sm text-muted-foreground">User has disabled status tracking</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
