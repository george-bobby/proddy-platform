'use client';

import {
  MessageSquare,
  PaintBucket,
  FileText,
  LayoutGrid,
  Video
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

const Topbar = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const tabs = [
    {
      label: 'Chat',
      icon: MessageSquare,
      href: `/workspace/${workspaceId}/channel/${channelId}/chats`,
      active: pathname.includes(`/channel/${channelId}/chats`),
    },
    {
      label: 'Canvas',
      icon: PaintBucket,
      href: `/workspace/${workspaceId}/channel/${channelId}/canvas`,
      active: pathname.includes(`/channel/${channelId}/canvas`),
    },
    {
      label: 'Notes',
      icon: FileText,
      href: `/workspace/${workspaceId}/channel/${channelId}/notes`,
      active: pathname.includes(`/channel/${channelId}/notes`),
    },
    {
      label: 'Boards',
      icon: LayoutGrid,
      href: `/workspace/${workspaceId}/channel/${channelId}/board`,
      active: pathname.includes(`/channel/${channelId}/board`),
    },
    {
      label: 'Meets',
      icon: Video,
      href: `/workspace/${workspaceId}/channel/${channelId}/meets`,
      active: pathname.includes(`/channel/${channelId}/meets`),
    },
  ];

  // Determine the current active tab value
  const activeTab = tabs.find(tab => tab.active)?.href.split('/').pop() || 'chats';

  return (
    <div className="flex w-full items-center justify-center border-b bg-white shadow-sm">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-5 bg-white p-0 rounded-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger
                key={tab.href}
                value={tab.href.split('/').pop() || ''}
                className={cn(
                  "flex h-full items-center justify-center gap-x-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground",
                  tab.active && "border-primary text-primary hover:bg-primary/5"
                )}
                asChild
              >
                <Link
                  href={tab.href}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <span className="hidden md:inline-block ml-2 text-xs md:text-sm">{tab.label}</span>
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default Topbar;
