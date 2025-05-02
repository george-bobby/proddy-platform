'use client';

import { FaChevronDown } from 'react-icons/fa';
import { Loader, TriangleAlert } from 'lucide-react';

import type { Id } from '@/../convex/_generated/dataModel';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { Button } from '@/components/ui/button';
import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { useChannelId } from '@/hooks/use-channel-id';
import { WorkspaceHeader } from '../../toolbar';

const ChannelIdPage = () => {
  const channelId = useChannelId();

  // Always call the hook, but with a valid channelId
  const { results, status, loadMore } = useGetMessages({
    channelId: channelId as Id<'channels'>
  });
  const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });

  if (channelLoading || status == 'LoadingFirstPage') {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-2">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found.</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <span className="truncate"># {channel.name}</span>
          <FaChevronDown className="ml-2 size-2.5 transition-transform duration-200 group-hover:rotate-180" />
        </Button>
      </WorkspaceHeader>

      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === 'LoadingMore'}
        canLoadMore={status === 'CanLoadMore'}
      />

      <ChatInput
        placeholder={`Message # ${channel.name}`}
        channelId={channelId}
        channelName={channel.name}
      />
    </div>
  );
};

export default ChannelIdPage;
