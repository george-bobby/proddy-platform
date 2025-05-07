import { useMutation } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export const useMarkAllMentionsAsRead = () => {
  const workspaceId = useWorkspaceId();
  const markAllAsRead = useMutation(api.mentions.markAllMentionsAsRead);

  const execute = async () => {
    try {
      if (!workspaceId) {
        console.error('No workspace ID available');
        return false;
      }

      await markAllAsRead({ workspaceId });
      return true;
    } catch (error) {
      console.error('Error marking all mentions as read:', error);
      return false;
    }
  };

  return execute;
};
