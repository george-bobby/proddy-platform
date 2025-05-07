'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { AtSign } from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useChannelId } from '@/hooks/use-channel-id';
import { toast } from 'sonner';

export const TestMentionButton = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [isLoading, setIsLoading] = useState(false);

  const createTestMention = useMutation(api.mentions.createTestMention);
  const createCompleteTestMention = useMutation(api.mentions.createCompleteTestMention);
  const createTestMentionMessage = useMutation(api.messages.createTestMentionMessage);
  const getAllMentions = useQuery(api.mentions.getAllMentions, workspaceId ? { workspaceId } : "skip");
  const processedMentions = useQuery(api.mentions.getProcessedMentions, workspaceId ? { workspaceId } : "skip");

  const handleClick = async () => {
    if (!workspaceId || !channelId) {
      toast.error('Workspace ID or Channel ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      // Create a complete test mention with proper message content
      const completeMentionId = await createCompleteTestMention({
        workspaceId,
        channelId
      });

      toast.success('Test mention created successfully!');
      console.log('Created complete test mention with ID:', completeMentionId);
    } catch (error) {
      console.error('Error creating test mention:', error);
      toast.error('Failed to create test mention');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckMentions = () => {
    if (!workspaceId) {
      toast.error('Workspace ID is missing');
      return;
    }

    console.log('All mentions in workspace:', getAllMentions);
    if (getAllMentions) {
      toast.success(`Found ${getAllMentions.length} mentions in workspace`);
    } else {
      toast.error('No mentions data available');
    }
  };

  const handleCheckProcessedMentions = () => {
    if (!workspaceId) {
      toast.error('Workspace ID is missing');
      return;
    }

    console.log('Processed mentions:', processedMentions);
    if (processedMentions) {
      toast.success(`Found ${processedMentions.length} processed mentions`);
    } else {
      toast.error('No processed mentions data available');
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !workspaceId || !channelId}
      variant="outline"
      size="sm"
      className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
          Creating...
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <AtSign className="h-3.5 w-3.5" />
          Create Test Mention
        </span>
      )}
    </Button>
  );
};
