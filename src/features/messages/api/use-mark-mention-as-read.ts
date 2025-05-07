import { useMutation } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

export const useMarkMentionAsRead = () => {
  const markMention = useMutation(api.mentions.markMentionAsRead);

  const execute = async (mentionId: Id<'mentions'>, status?: boolean) => {
    try {
      if (!mentionId) {
        console.error('No mention ID provided');
        return false;
      }

      await markMention({
        mentionId,
        status // If undefined, the backend will default to marking as read
      });

      return true;
    } catch (error) {
      console.error('Error changing mention read status:', error);
      return false;
    }
  };

  return execute;
};
