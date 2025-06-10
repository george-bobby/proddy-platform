'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
	Check,
	Loader,
	AlertCircle,
	Unlink,
	RefreshCw,
	ExternalLink,
	Mail,
	Ticket,
	FileText,
	CheckSquare,
} from 'lucide-react';
import { FaGithub, FaSlack } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';

interface ServiceIntegrationCardProps {
	workspaceId: Id<'workspaces'>;
	service: 'github' | 'gmail' | 'slack' | 'jira' | 'notion' | 'clickup';
	integration?: any;
	currentMember: any;
	onConnectionChange?: () => void;
}

const integrations = {
	github: {
		icon: FaGithub,
		color: 'bg-gray-900 hover:bg-gray-800',
		name: 'GitHub',
		description: 'Connect to GitHub for repository management and issue tracking',
	},
	gmail: {
		icon: Mail,
		color: 'bg-red-600 hover:bg-red-700',
		name: 'Gmail',
		description: 'Connect to Gmail for email management and automation',
	},
	slack: {
		icon: FaSlack,
		color: 'bg-purple-600 hover:bg-purple-700',
		name: 'Slack',
		description: 'Connect to Slack for team communication and notifications',
	},
	jira: {
		icon: Ticket,
		color: 'bg-blue-600 hover:bg-blue-700',
		name: 'Jira',
		description: 'Connect to Jira for project management and issue tracking',
	},
	notion: {
		icon: FileText,
		color: 'bg-gray-800 hover:bg-gray-700',
		name: 'Notion',
		description: 'Connect to Notion for document management and collaboration',
	},
	clickup: {
		icon: CheckSquare,
		color: 'bg-pink-600 hover:bg-pink-700',
		name: 'ClickUp',
		description: 'Connect to ClickUp for task management and productivity',
	},
};

export const ServiceIntegrationCard = ({
	workspaceId,
	service,
	integration,
	currentMember,
	onConnectionChange,
}: ServiceIntegrationCardProps) => {
	const [isConnecting, setIsConnecting] = useState(false);
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<{
		connected: boolean;
		connectionId?: string;
		status?: string;
		error?: string;
	}>({ connected: !!integration && integration.status === 'connected' });

	// Convex hooks
	const initiateConnection = useAction(api.integrations.initiateConnection);
	const disconnectIntegration = useMutation(api.integrations.disconnect);
	const checkConnection = useAction(api.integrations.checkConnectionStatus);

	const IconComponent = integrations[service].icon;
	const isConnected = integration && integration.status === 'connected';
	const isOwnerOrAdmin = currentMember.role === 'owner' || currentMember.role === 'admin';

	const handleConnect = async () => {
		if (!isOwnerOrAdmin) {
			toast.error('Only workspace owners and administrators can manage integrations');
			return;
		}

		setIsConnecting(true);

		try {
			const result = await initiateConnection({ workspaceId, service });

			// Redirect to service OAuth
			window.location.href = result.redirectUrl;
		} catch (error) {
			console.error(`Error connecting ${service}:`, error);
			toast.error(`Failed to connect ${integrations[service].name} account`);
			setIsConnecting(false);
		}
	};

	const handleDisconnect = async () => {
		if (!isOwnerOrAdmin) {
			toast.error('Only workspace owners and administrators can manage integrations');
			return;
		}

		setIsDisconnecting(true);

		try {
			await disconnectIntegration({ workspaceId, service });
			toast.success(`${integrations[service].name} disconnected successfully`);
			onConnectionChange?.();
		} catch (error) {
			console.error(`Error disconnecting ${service}:`, error);
			toast.error(`Failed to disconnect ${integrations[service].name}`);
		} finally {
			setIsDisconnecting(false);
		}
	};

	const checkConnectionStatus = async () => {
		if (!integration?.entityId) return;

		try {
			const status = await checkConnection({
				entityId: integration.entityId,
				service,
			});
			setConnectionStatus(status);
		} catch (error) {
			console.error(`Error checking ${service} connection:`, error);
		}
	};

	return (
		<Card className="relative overflow-hidden">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className={`p-2 rounded-lg text-white ${integrations[service].color}`}>
							<IconComponent className="h-5 w-5" />
						</div>
						<div>
							<CardTitle className="text-lg">{integrations[service].name}</CardTitle>
							<CardDescription className="text-sm">
								{integrations[service].description}
							</CardDescription>
						</div>
					</div>
					{isConnected && (
						<Badge variant="secondary" className="bg-green-100 text-green-800">
							<Check className="h-3 w-3 mr-1" />
							Connected
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{isConnected ? (
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Check className="h-4 w-4 text-green-600" />
							<span>
								Connected on{' '}
								{new Date(integration.connectedAt).toLocaleDateString()}
							</span>
						</div>

						{integration.lastUsed && (
							<div className="text-sm text-muted-foreground">
								Last used: {new Date(integration.lastUsed).toLocaleDateString()}
							</div>
						)}

						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={checkConnectionStatus}
								disabled={!isOwnerOrAdmin}
							>
								<RefreshCw className="mr-2 h-4 w-4" />
								Refresh
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={handleDisconnect}
								disabled={isDisconnecting || !isOwnerOrAdmin}
							>
								{isDisconnecting ? (
									<>
										<Loader className="mr-2 h-4 w-4 animate-spin" />
										Disconnecting...
									</>
								) : (
									<>
										<Unlink className="mr-2 h-4 w-4" />
										Disconnect
									</>
								)}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{!isOwnerOrAdmin && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<AlertCircle className="h-4 w-4" />
								<span>Only workspace owners and administrators can connect services</span>
							</div>
						)}

						<Button
							onClick={handleConnect}
							disabled={isConnecting || !isOwnerOrAdmin}
							className={`w-full ${integrations[service].color} text-white`}
						>
							{isConnecting ? (
								<>
									<Loader className="mr-2 h-4 w-4 animate-spin" />
									Connecting...
								</>
							) : (
								<>
									<IconComponent className="mr-2 h-4 w-4" />
									Connect {integrations[service].name}
								</>
							)}
						</Button>
					</div>
				)}
			</CardContent>

			{/* Connection status indicator */}
			<div
				className={`absolute top-0 right-0 w-3 h-3 rounded-full m-3 ${isConnected ? 'bg-green-500' : 'bg-gray-300'
					}`}
			/>
		</Card>
	);
};
