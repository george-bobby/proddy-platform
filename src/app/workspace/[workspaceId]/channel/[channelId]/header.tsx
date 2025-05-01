'use client';

import { ChannelInfo } from '@/components/workspace/channel-info';
import { WorkspaceHeader } from '../../workspace-toolbar';

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
