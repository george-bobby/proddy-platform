'use client';

import { Loader, TriangleAlert } from 'lucide-react';

import type { Id } from '@/../convex/_generated/dataModel';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { useChannelId } from '@/hooks/use-channel-id';

const ChannelChatPage = () => {
    // Always call hooks at the top level, never conditionally
    const channelId = useChannelId();
    console.log('ChannelChatPage - channelId from useChannelId:', channelId);
    console.log('ChannelChatPage - URL params:', window.location.pathname);

    // Pass the channelId to useGetMessages - the hook will handle undefined values
    const { results, status, loadMore } = useGetMessages({
        channelId: channelId
    });

    // If channelId is undefined, this will be handled by the hook
    const { data: channel, isLoading: channelLoading } = useGetChannel({
        id: channelId
    });

    console.log('ChannelChatPage - channel data:', channel);

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

    // Log the exact values being passed to ChatInput
    console.log('ChannelChatPage - Passing to ChatInput:', {
        channelId,
        channelName: channel.name
    });

    return (
        <div className="flex h-full flex-col">
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

export default ChannelChatPage;