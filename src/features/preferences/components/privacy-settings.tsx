'use client';

import { useState } from 'react';
import { Eye, EyeOff, Shield, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUserPreferences } from '../api/use-user-preferences';

export const PrivacySettings = () => {
	const { data: preferences, updateSettings, isLoading } = useUserPreferences();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStatusTrackingToggle = async (enabled: boolean) => {
		setIsUpdating(true);
		try {
			await updateSettings({
				statusTracking: enabled,
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleNotificationsToggle = async (enabled: boolean) => {
		setIsUpdating(true);
		try {
			await updateSettings({
				notifications: enabled,
			});
		} finally {
			setIsUpdating(false);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Privacy Settings
					</CardTitle>
					<CardDescription>Loading your privacy preferences...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const statusTrackingEnabled = preferences?.settings?.statusTracking ?? true;
	const notificationsEnabled = preferences?.settings?.notifications ?? true;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Shield className="h-5 w-5" />
					Privacy Settings
				</CardTitle>
				<CardDescription>
					Control how your activity and presence is tracked and shared with others
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Status Tracking */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="flex items-center gap-2 text-base font-medium">
								<Activity className="h-4 w-4" />
								Status Tracking
							</Label>
							<p className="text-sm text-muted-foreground">
								Allow others to see when you're online and your last seen time
							</p>
						</div>
						<Switch
							checked={statusTrackingEnabled}
							onCheckedChange={handleStatusTrackingToggle}
							disabled={isUpdating}
						/>
					</div>
					
					{!statusTrackingEnabled && (
						<div className="rounded-lg bg-muted/50 p-3">
							<div className="flex items-center gap-2 text-sm">
								<EyeOff className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									Your status will appear as offline to others, and your last seen time won't be updated
								</span>
							</div>
						</div>
					)}
				</div>

				<Separator />

				{/* Notifications */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="flex items-center gap-2 text-base font-medium">
								<Eye className="h-4 w-4" />
								Notifications
							</Label>
							<p className="text-sm text-muted-foreground">
								Receive notifications for mentions, messages, and updates
							</p>
						</div>
						<Switch
							checked={notificationsEnabled}
							onCheckedChange={handleNotificationsToggle}
							disabled={isUpdating}
						/>
					</div>
				</div>

				<Separator />

				{/* Privacy Notice */}
				<div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
					<div className="flex items-start gap-3">
						<Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
						<div className="space-y-1">
							<h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
								Privacy Notice
							</h4>
							<p className="text-sm text-blue-700 dark:text-blue-300">
								These settings only affect how your activity is displayed to other users. 
								System logs and security monitoring may still record activity for platform security.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
