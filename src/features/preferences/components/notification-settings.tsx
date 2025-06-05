'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, UserPlus, Calendar, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPreferences, useNotificationPreferences } from '../api/use-user-preferences';

export const NotificationSettings = () => {
	const { updateSettings } = useUserPreferences();
	const { data: notifications, isLoading } = useNotificationPreferences();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleNotificationToggle = async (type: string, enabled: boolean) => {
		setIsUpdating(true);
		try {
			await updateSettings({
				notifications: {
					...notifications,
					[type]: enabled,
				},
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleWeeklyDigestDayChange = async (day: string) => {
		setIsUpdating(true);
		try {
			await updateSettings({
				notifications: {
					...notifications,
					weeklyDigestDay: day as any,
				},
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
						<Bell className="h-5 w-5" />
						Notification Settings
					</CardTitle>
					<CardDescription>Loading your notification preferences...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const notificationTypes = [
		{
			key: 'mentions',
			title: 'Mentions',
			description: 'Get notified when someone mentions you in a message',
			icon: MessageSquare,
			enabled: notifications?.mentions ?? true,
		},
		{
			key: 'assignee',
			title: 'Task Assignments',
			description: 'Get notified when you are assigned to a task or card',
			icon: UserPlus,
			enabled: notifications?.assignee ?? true,
		},
		{
			key: 'threadReply',
			title: 'Thread Replies',
			description: 'Get notified when someone replies to a thread you participated in',
			icon: MessageSquare,
			enabled: notifications?.threadReply ?? true,
		},
		{
			key: 'directMessage',
			title: 'Direct Messages',
			description: 'Get notified when you receive a direct message',
			icon: Mail,
			enabled: notifications?.directMessage ?? true,
		},
	];

	const weeklyDigestEnabled = notifications?.weeklyDigest ?? false;
	const weeklyDigestDay = notifications?.weeklyDigestDay ?? 'monday';

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Notification Settings
				</CardTitle>
				<CardDescription>
					Control which email notifications you receive for workspace activities
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Individual notification toggles */}
				{notificationTypes.map((notification, index) => (
					<div key={notification.key}>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label className="flex items-center gap-2 text-base font-medium">
									<notification.icon className="h-4 w-4" />
									{notification.title}
								</Label>
								<p className="text-sm text-muted-foreground">
									{notification.description}
								</p>
							</div>
							<Switch
								checked={notification.enabled}
								onCheckedChange={(enabled) => handleNotificationToggle(notification.key, enabled)}
								disabled={isUpdating}
							/>
						</div>
						{index < notificationTypes.length - 1 && <Separator className="mt-4" />}
					</div>
				))}

				<Separator />

				{/* Weekly Digest */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<Label className="flex items-center gap-2 text-base font-medium">
								<Calendar className="h-4 w-4" />
								Weekly Digest
							</Label>
							<p className="text-sm text-muted-foreground">
								Receive a weekly summary of workspace activity and reports
							</p>
						</div>
						<Switch
							checked={weeklyDigestEnabled}
							onCheckedChange={(enabled) => handleNotificationToggle('weeklyDigest', enabled)}
							disabled={isUpdating}
						/>
					</div>

					{weeklyDigestEnabled && (
						<div className="ml-6 space-y-2">
							<Label className="text-sm font-medium">Delivery Day</Label>
							<Select
								value={weeklyDigestDay}
								onValueChange={handleWeeklyDigestDayChange}
								disabled={isUpdating}
							>
								<SelectTrigger className="w-48">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="monday">Monday</SelectItem>
									<SelectItem value="tuesday">Tuesday</SelectItem>
									<SelectItem value="wednesday">Wednesday</SelectItem>
									<SelectItem value="thursday">Thursday</SelectItem>
									<SelectItem value="friday">Friday</SelectItem>
									<SelectItem value="saturday">Saturday</SelectItem>
									<SelectItem value="sunday">Sunday</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								Choose which day of the week to receive your digest email
							</p>
						</div>
					)}
				</div>

				<Separator />

				{/* Privacy Notice */}
				<div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
					<div className="flex items-start gap-3">
						<Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
						<div className="space-y-1">
							<h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
								Email Notifications
							</h4>
							<p className="text-sm text-blue-700 dark:text-blue-300">
								These settings control email notifications only. You can still receive in-app notifications 
								regardless of these settings. Unsubscribe links are included in all emails.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
