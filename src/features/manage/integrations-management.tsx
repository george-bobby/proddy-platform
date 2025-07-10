'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {toast} from 'sonner';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../../components/ui/tabs';
import {Server, Settings, Zap} from 'lucide-react';
import {ServiceIntegrationCard} from './service-integration-card';
import {useAction, useQuery} from 'convex/react';
import {api} from '../../../convex/_generated/api';
import {Id} from '../../../convex/_generated/dataModel';

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

    // Convex hooks for v3 API
    const authConfigs = useQuery(api.integrations.getAuthConfigs, {workspaceId});
    const connectedAccounts = useQuery(api.integrations.getConnectedAccounts, {workspaceId});
    const mcpServers = useQuery(api.integrations.getMCPServers, {workspaceId});
    const completeConnection = useAction(api.integrations.completeConnection);

    const handleConnectionComplete = useCallback(async (toolkit: string, authConfigId: string, connectionData?: string) => {
        try {
            // Parse connection data if provided
            const parsedConnectionData = connectionData ? JSON.parse(decodeURIComponent(connectionData)) : {};

            // Complete connection using v3 API
            await completeConnection({
                workspaceId,
                authConfigId: authConfigId as Id<'auth_configs'>,
                userId: currentMember.userId,
                connectionData: {
                    id: parsedConnectionData.id || `conn_${Date.now()}`,
                    status: 'ACTIVE',
                    ...parsedConnectionData,
                },
            });

            // Refresh the data
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Error completing connection:', error);
            toast.error('Failed to complete connection setup');
        }
    }, [completeConnection, workspaceId, currentMember.userId]);

    // Check if user just returned from OAuth (AgentAuth callback)
    useEffect(() => {
        const connected = searchParams.get('connected');
        const toolkit = searchParams.get('toolkit');
        const authConfigId = searchParams.get('authConfigId');
        const connectionData = searchParams.get('connectionData');

        if (connected === 'true' && toolkit && authConfigId) {
            toast.success(`${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} connected successfully!`);

            // Handle the connection completion using AgentAuth
            handleConnectionComplete(toolkit, authConfigId, connectionData || undefined);

            // Remove the query parameters
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('connected');
            newUrl.searchParams.delete('toolkit');
            newUrl.searchParams.delete('authConfigId');
            newUrl.searchParams.delete('connectionData');
            router.replace(newUrl.pathname + newUrl.search);
        }
    }, [searchParams, router, handleConnectionComplete]);

    const handleConnectionChange = () => {
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
                <h3 className="text-lg font-semibold tracking-tight">Composio v3 + AgentAuth Integrations</h3>
                <p className="text-sm text-muted-foreground">
                    Connect your workspace to external services using Composio's v3 API with AgentAuth for
                    AI-powered automation and enhanced productivity features.
                </p>
            </div>

            <Tabs defaultValue="integrations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="integrations" className="flex items-center gap-2">
                        <Settings className="h-4 w-4"/>
                        Integrations
                    </TabsTrigger>
                    <TabsTrigger value="mcp-servers" className="flex items-center gap-2">
                        <Server className="h-4 w-4"/>
                        MCP Servers
                    </TabsTrigger>
                    <TabsTrigger value="agent-auth" className="flex items-center gap-2">
                        <Zap className="h-4 w-4"/>
                        AgentAuth
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="space-y-6">
                    <div>
                        <h4 className="text-md font-medium">Service Integrations</h4>
                        <p className="text-sm text-muted-foreground">
                            Connect to external services using Composio-managed authentication.
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

                </TabsContent>

                <TabsContent value="mcp-servers" className="space-y-6">
                    <div>
                        <h4 className="text-md font-medium">MCP Servers for AI Agents</h4>
                        <p className="text-sm text-muted-foreground">
                            Create Model Context Protocol servers that AI agents can connect to for autonomous tool
                            discovery and execution.
                        </p>
                    </div>

                    {/* MCP Server Management Component */}
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            MCP Server management interface will be implemented here.
                            This will allow creating servers with specific toolkit configurations for AI agents.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="agent-auth" className="space-y-6">
                    <div>
                        <h4 className="text-md font-medium">AgentAuth Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                            Configure authentication settings for AI agents to autonomously handle OAuth flows and API
                            authentication.
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            AgentAuth configuration interface will be implemented here.
                            This will enable helper actions for autonomous authentication flows.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
