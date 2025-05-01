'use client';

import { ChannelInfo } from '@/components/workspace/channel-info';
import { WorkspaceHeader } from '@/components/workspace/workspace-header';

interface HeaderProps {
  channelName: string;
}

export const Header = ({ channelName }: HeaderProps) => {
  return (
    <WorkspaceHeader>
      <ChannelInfo channelName={channelName} />
    </WorkspaceHeader>
  );
};
