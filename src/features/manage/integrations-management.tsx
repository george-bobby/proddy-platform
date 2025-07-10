'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ServiceIntegrationCard } from './service-integration-card';
import { Id } from '../../../convex/_generated/dataModel';

type CurrentMember = {
    _id: Id<'members'>;
    userId: string;
    role: 'owner' | 'admin' | 'member';
};

interface IntegrationsManagementProps {
    workspaceId: Id<'workspaces'>;
    currentMember: CurrentMember;
}

const SUPPORTED_TOOLKITS = ['github', 'gmail', 'slack', 'jira', 'notion', 'clickup'] as const;

export const IntegrationsManagement = ({
    workspaceId,
    currentMember,
}: IntegrationsManagementProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [refreshKey, setRefreshKey] = useState(0);

    // State for data fetching
    const [authConfigs, setAuthConfigs] = useState<any[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data from API routes
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Fetch auth configs
            const authConfigsResponse = await fetch(`/api/composio/auth-configs?workspaceId=${workspaceId}`);
            const authConfigsData = authConfigsResponse.ok ? await authConfigsResponse.json() : [];

            // Fetch connected accounts
            const accountsResponse = await fetch(`/api/composio/connections?workspaceId=${workspaceId}`);
            const accountsData = accountsResponse.ok ? await accountsResponse.json() : [];

            setAuthConfigs(authConfigsData);
            setConnectedAccounts(accountsData);
        } catch (error) {
            console.error('Error fetching integration data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    const handleConnectionComplete = useCallback(async (toolkit: string, userId?: string) => {
        try {
            // Complete connection using AgentAuth
            const response = await fetch('/api/composio/agentauth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'complete',
                    userId: userId || currentMember.userId,
                    toolkit,
                    workspaceId,
                    memberId: currentMember._id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to complete AgentAuth connection');
            }

            const result = await response.json();

            // Refresh the data
            await fetchData();
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Error completing AgentAuth connection:', error);
            toast.error('Failed to complete connection setup');
        }
    }, [workspaceId, currentMember.userId, currentMember._id, fetchData]);

    // Check if user just returned from OAuth (AgentAuth callback)
    useEffect(() => {
        const connected = searchParams.get('connected');
        const toolkit = searchParams.get('toolkit');
        const userId = searchParams.get('userId');

        if (connected === 'true' && toolkit) {
            toast.success(`${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} authorization completed!`);

            // Handle the connection completion using AgentAuth
            handleConnectionComplete(toolkit, userId || undefined);

            // Remove the query parameters
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('connected');
            newUrl.searchParams.delete('toolkit');
            newUrl.searchParams.delete('userId');
            router.replace(newUrl.pathname + newUrl.search);
        }
    }, [searchParams, router, handleConnectionComplete]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleConnectionChange = () => {
        fetchData();
        setRefreshKey(prev => prev + 1);
    };

    // Create maps for easier lookup
    const authConfigsByToolkit = authConfigs?.reduce((acc, config) => {
        acc[config.toolkit] = config;
        return acc;
    }, {} as Record<string, any>) || {};

    const connectedAccountsByToolkit = connectedAccounts?.reduce((acc, account) => {
        acc[account.toolkit] = account;
        return acc;
    }, {} as Record<string, any>) || {};

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold tracking-tight">Service Integrations</h3>
                <p className="text-sm text-muted-foreground">
                    Connect your workspace to external services using Composio's v3 API with AgentAuth for
                    AI-powered automation and enhanced productivity features.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_TOOLKITS.map((toolkit) => (
                    <ServiceIntegrationCard
                        key={`${toolkit}-${refreshKey}`}
                        workspaceId={workspaceId}
                        toolkit={toolkit}
                        authConfig={authConfigsByToolkit[toolkit]}
                        connectedAccount={connectedAccountsByToolkit[toolkit]}
                        currentMember={currentMember}
                        onConnectionChange={handleConnectionChange}
                    />
                ))}
            </div>
        </div>
    );
};
