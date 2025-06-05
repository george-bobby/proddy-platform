'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { ServiceIntegrationCard } from './service-integration-card';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';

interface IntegrationsManagementProps {
	workspaceId: Id<'workspaces'>;
	currentMember: any;
}

const SUPPORTED_SERVICES = ['github', 'gmail', 'slack', 'jira', 'notion', 'clickup'] as const;

export const IntegrationsManagement = ({
	workspaceId,
	currentMember,
}: IntegrationsManagementProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [refreshKey, setRefreshKey] = useState(0);

	// Convex hooks
	const integrations = useQuery(api.integrations.getByWorkspaceId, { workspaceId });
	const connectIntegration = useMutation(api.integrations.connect);

	// Check if user just returned from OAuth
	useEffect(() => {
		const connected = searchParams.get('connected');
		const service = searchParams.get('service');

		if (connected === 'true' && service) {
			toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} connected successfully!`);

			// Handle the connection completion
			handleConnectionComplete(service as any);

			// Remove the query parameters
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete('connected');
			newUrl.searchParams.delete('service');
			router.replace(newUrl.pathname + newUrl.search);
		}
	}, [searchParams, router]);

	const handleConnectionComplete = async (service: string) => {
		try {
			// Create entity ID for this connection
			const entityId = `workspace_${workspaceId}_user_${currentMember.userId}_${service}`;

			// For now, we'll create a placeholder connection
			// In a real implementation, you'd get the actual connection details from Composio
			await connectIntegration({
				workspaceId,
				service: service as any,
				connectedAccountId: `conn_${Date.now()}`, // Placeholder
				entityId,
				metadata: {
					connectedAt: Date.now(),
					service,
				},
			});

			// Refresh the integrations list
			setRefreshKey(prev => prev + 1);
		} catch (error) {
			console.error('Error completing connection:', error);
			toast.error('Failed to complete connection setup');
		}
	};

	const handleConnectionChange = () => {
		setRefreshKey(prev => prev + 1);
	};

	// Create a map of integrations by service
	const integrationsByService = integrations?.reduce((acc, integration) => {
		acc[integration.service] = integration;
		return acc;
	}, {} as Record<string, any>) || {};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold tracking-tight">Third-Party Integrations</h3>
				<p className="text-sm text-muted-foreground">
					Connect your workspace to external services to enable AI-powered automation and enhanced
					productivity features.
				</p>
			</div>

			<Separator />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{SUPPORTED_SERVICES.map((service) => (
					<ServiceIntegrationCard
						key={`${service}-${refreshKey}`}
						workspaceId={workspaceId}
						service={service}
						integration={integrationsByService[service]}
						currentMember={currentMember}
						onConnectionChange={handleConnectionChange}
					/>
				))}
			</div>

			<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<h4 className="font-medium text-blue-900 mb-2">AI Assistant Integration</h4>
				<p className="text-sm text-blue-800">
					Once connected, you can use the AI assistant in your workspace to interact with these
					services. For example, ask the AI to "Create a GitHub issue" or "Send an email via Gmail"
					and it will use your connected accounts to perform these actions.
				</p>
			</div>
		</div>
	);
};
