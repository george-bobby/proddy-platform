import { useQuery, useMutation } from 'convex/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { api } from '@/../convex/_generated/api';

export const useUserPreferences = () => {
	const data = useQuery(api.userPreferences.getUserPreferences);
	const updatePreferences = useMutation(api.userPreferences.updateUserPreferences);

	const updateSettings = useCallback(
		async (settings: {
			theme?: string;
			notifications?: boolean;
			statusTracking?: boolean;
		}) => {
			try {
				await updatePreferences({ settings });
				toast.success('Preferences updated successfully');
			} catch (error) {
				console.error('Failed to update preferences:', error);
				toast.error('Failed to update preferences');
			}
		},
		[updatePreferences]
	);

	return {
		data,
		updateSettings,
		isLoading: data === undefined,
	};
};

export const useStatusTrackingEnabled = () => {
	const data = useQuery(api.userPreferences.isStatusTrackingEnabled);
	return {
		isEnabled: data ?? true, // Default to true
		isLoading: data === undefined,
	};
};
