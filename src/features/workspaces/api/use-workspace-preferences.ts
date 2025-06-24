import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import {
	WorkspacePreference,
	DashboardWidget,
	WidgetSize,
} from '../../../../convex/preferences';

/**
 * Hook to get workspace preferences for a specific workspace
 */
export const useWorkspacePreferences = ({
	workspaceId,
}: {
	workspaceId: Id<'workspaces'>;
}) => {
	const data = useQuery(api.preferences.getWorkspacePreferences, {
		workspaceId,
	});
	const isLoading = data === undefined;

	return { data, isLoading };
};

/**
 * Hook to update workspace preferences for a specific workspace
 */
export const useUpdateWorkspacePreferences = () => {
	return useMutation(api.preferences.updateWorkspacePreferences);
};

/**
 * Hook to manage sidebar collapsed state with Convex persistence
 */
export const useSidebarCollapsed = ({
	workspaceId,
}: {
	workspaceId: Id<'workspaces'>;
}) => {
	// Local state for immediate UI updates
	const [isCollapsed, setIsCollapsedLocal] = useState(false);

	// Get preferences from Convex
	const { data: preferences, isLoading } = useWorkspacePreferences({
		workspaceId,
	});

	// Mutation to update the collapsed state in Convex
	const updateSidebarCollapsed = useMutation(
		api.preferences.updateSidebarCollapsed
	);

	// Initialize local state from Convex when data is loaded
	useEffect(() => {
		if (!isLoading && preferences) {
			setIsCollapsedLocal(preferences.sidebarCollapsed || false);
		}
	}, [preferences, isLoading]);

	// Function to update both local state and Convex
	const setIsCollapsed = (collapsed: boolean) => {
		setIsCollapsedLocal(collapsed);
		updateSidebarCollapsed({ workspaceId, isCollapsed: collapsed });
	};

	return [isCollapsed, setIsCollapsed] as const;
};

/**
 * Hook to manage dashboard widgets with Convex persistence
 */
export const useDashboardWidgets = ({
	workspaceId,
}: {
	workspaceId: Id<'workspaces'>;
}) => {
	// Define the widget type
	type WidgetConfig = DashboardWidget;

	// Default widget configuration
	const defaultWidgets: WidgetConfig[] = [
		{
			id: 'calendar',
			title: 'Upcoming Events',
			description: 'Shows events for the next 7 days',
			visible: true,
			size: 'large',
		},
		{
			id: 'mentions',
			title: 'Mentions',
			description: 'Shows messages where you were mentioned',
			visible: true,
			size: 'small',
		},
		{
			id: 'threads',
			title: 'Thread Replies',
			description: 'Shows replies to your message threads',
			visible: true,
			size: 'small',
		},
		{
			id: 'tasks',
			title: 'Your Tasks',
			description: 'Shows your assigned tasks',
			visible: true,
			size: 'small',
		},
		{
			id: 'cards',
			title: 'Board Cards',
			description: 'Shows your assigned board cards',
			visible: true,
			size: 'small',
		},
		{
			id: 'notes',
			title: 'Recent Notes',
			description: 'Shows recently updated notes',
			visible: true,
			size: 'small',
		},
		{
			id: 'canvas',
			title: 'Recent Canvas',
			description: 'Shows recently updated canvas items',
			visible: true,
			size: 'small',
		},
	];

	// Local state for immediate UI updates
	const [widgets, setWidgetsLocal] = useState<WidgetConfig[]>(defaultWidgets);

	// Get preferences from Convex
	const { data: preferences, isLoading } = useWorkspacePreferences({
		workspaceId,
	});

	// Mutation to update widgets in Convex
	const updateDashboardWidgets = useMutation(
		api.preferences.updateDashboardWidgets
	);

	// Initialize local state from Convex when data is loaded
	useEffect(() => {
		if (!isLoading && preferences && preferences.dashboardWidgets) {
			setWidgetsLocal(preferences.dashboardWidgets);
		}
	}, [preferences, isLoading]);

	// Function to update both local state and Convex
	const setWidgets = (
		newWidgetsOrUpdater:
			| WidgetConfig[]
			| ((prev: WidgetConfig[]) => WidgetConfig[])
	) => {
		if (typeof newWidgetsOrUpdater === 'function') {
			// If it's a function updater
			setWidgetsLocal((prev) => {
				const newWidgets = newWidgetsOrUpdater(prev);
				updateDashboardWidgets({ workspaceId, dashboardWidgets: newWidgets });
				return newWidgets;
			});
		} else {
			// If it's a direct value
			setWidgetsLocal(newWidgetsOrUpdater);
			updateDashboardWidgets({
				workspaceId,
				dashboardWidgets: newWidgetsOrUpdater,
			});
		}
	};

	return [widgets, setWidgets] as const;
};
