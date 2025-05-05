import { useMutation } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

export const useMarkMentionAsRead = () => {
  const markAsRead = useMutation(api.mentions.markMentionAsRead);

  const execute = async (mentionId: Id<'mentions'>) => {
    try {
      await markAsRead({ mentionId });
      return true;
    } catch (error) {
      console.error('Error marking mention as read:', error);
      return false;
    }
  };

  return execute;
};
