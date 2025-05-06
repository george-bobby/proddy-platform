'use client';

import {
  MessageSquare,
  PaintBucket,
  FileText,
  LayoutGrid,
  Video
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { useCurrentUser } from '@/features/auth/api/use-current-user';

const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { data: currentUser } = useCurrentUser();
  const [isCreatingLiveMessage, setIsCreatingLiveMessage] = useState(false);

  // Get current member to include in the live message
  const currentMember = useQuery(
    api.members.current,
    workspaceId ? { workspaceId } : "skip"
  );

  // Create message mutation
  const createMessage = useMutation(api.messages.create);

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

  // Handle canvas button click
  const handleCanvasClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!workspaceId || !channelId || !currentMember || !currentUser) return;

    try {
      // Prevent default navigation
      e.preventDefault();

      // Show loading state
      setIsCreatingLiveMessage(true);

      // Generate a unique room ID for the canvas
      const timestamp = Date.now();
      const roomId = `canvas-${channelId}-${timestamp}`;

      // Create a live message in the channel
      await createMessage({
        workspaceId: workspaceId,
        channelId: channelId as Id<"channels">,
        body: JSON.stringify({
          type: "canvas-live",
          roomId: roomId,
          participants: [currentUser._id],
        }),
      });

      // Navigate to the canvas page with the room ID and explicitly set new=true to force a new canvas
      window.location.href = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${roomId}&new=true&t=${timestamp}`;
    } catch (error) {
      console.error("Error creating live canvas message:", error);
      toast.error("Failed to create canvas session");
      setIsCreatingLiveMessage(false);
    }
  };

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
                  onClick={tab.label === 'Canvas' ? handleCanvasClick : undefined}
                >
                  {isCreatingLiveMessage && tab.label === 'Canvas' ? (
                    <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  )}
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
