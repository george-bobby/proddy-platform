'use client';

import { FaChevronDown } from 'react-icons/fa';
import { Loader, TriangleAlert } from 'lucide-react';
import { PropsWithChildren } from 'react';

import { Button } from '@/components/ui/button';
import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { useChannelId } from '@/hooks/use-channel-id';
import { WorkspaceHeader } from '../../toolbar';
import Topbar from './topbar';

const ChannelLayout = ({ children }: PropsWithChildren) => {
  const channelId = useChannelId();
  const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });

  if (channelLoading) {
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
      
      <Topbar />
      
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default ChannelLayout;
