'use client';

import {
  AtSign,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Hash,
  Loader,
  MessageSquare,
  User,
  LayoutGrid,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useGetMentionedMessages } from '@/features/messages/api/use-get-mentioned-messages';
import { useMarkMentionAsRead } from '@/features/messages/api/use-mark-mention-as-read';
import { useMarkAllMentionsAsRead } from '@/features/messages/api/use-mark-all-mentions-as-read';
import { Id } from '@/../convex/_generated/dataModel';
import { Badge } from './ui/badge';

interface MentionsNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MentionsNotificationDialog = ({
  open,
  onOpenChange,
}: MentionsNotificationDialogProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: mentions, isLoading } = useGetMentionedMessages(true); // Get all mentions
  const markMentionAsRead = useMarkMentionAsRead();
  const markAllAsReadMutation = useMarkAllMentionsAsRead();
  const [activeTab, setActiveTab] = useState('all');

  // Debug logging
  useEffect(() => {
    console.log('MentionsNotificationDialog - Render with:', {
      workspaceId,
      mentions,
      isLoading,
      open
    });
  }, [workspaceId, mentions, isLoading, open]);

  const handleToggleReadStatus = async (mentionId: Id<'mentions'>, currentStatus: boolean) => {
    await markMentionAsRead(mentionId, !currentStatus);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation();
  };

  const formatRelativeTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'channel':
        return <Hash className="size-4 text-blue-500" />;
      case 'direct':
        return <User className="size-4 text-green-500" />;
      case 'thread':
        return <MessageSquare className="size-4 text-purple-500" />;
      case 'card':
        return <LayoutGrid className="size-4 text-amber-500" />;
      default:
        return <AtSign className="size-4 text-gray-500" />;
    }
  };

  const getSourceLink = (mention: any) => {
    switch (mention.source.type) {
      case 'channel':
        return `/workspace/${workspaceId}/channel/${mention.source.id}`;
      case 'direct':
        return `/workspace/${workspaceId}/member/${mention.source.id}`;
      case 'thread':
        return `/workspace/${workspaceId}/channel/${mention.source.id}`;
      case 'card':
        // For cards, we link to the channel's board page
        return `/workspace/${workspaceId}/channel/${mention.source.id}/board`;
      default:
        return `/workspace/${workspaceId}`;
    }
  };

  // Debug the mentions data
  console.log('MentionsNotificationDialog - Raw mentions data:', mentions);

  // Filter mentions based on active tab
  const filteredMentions = mentions.filter((mention: any) => {
    // Check if the mention has the required properties
    if (!mention || !mention.source) {
      console.log('MentionsNotificationDialog - Invalid mention:', mention);
      return false;
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !mention.read;
    return mention.source && mention.source.type === activeTab;
  });

  console.log('MentionsNotificationDialog - Filtered mentions:', {
    activeTab,
    filteredCount: filteredMentions.length
  });

  // Count unread mentions by type
  const unreadCounts = {
    all: mentions.filter((m: any) => !m.read).length || 0,
    channel: mentions.filter((m: any) => !m.read && m.source && m.source.type === 'channel').length || 0,
    direct: mentions.filter((m: any) => !m.read && m.source && m.source.type === 'direct').length || 0,
    thread: mentions.filter((m: any) => !m.read && m.source && m.source.type === 'thread').length || 0,
    card: mentions.filter((m: any) => !m.read && m.source && m.source.type === 'card').length || 0,
  };

  const renderMentionsList = (mentionsList: any[]) => (
    <div className="divide-y max-h-[450px] overflow-y-auto">
      {mentionsList?.length === 0 ? (
        <div className="flex h-[250px] w-full flex-col items-center justify-center gap-y-3 bg-gray-50">
          {activeTab === 'unread' ? (
            <>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="size-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">All caught up!</h2>
              <p className="text-sm text-muted-foreground">
                You have no unread mentions
              </p>
            </>
          ) : activeTab === 'all' ? (
            <>
              <div className="rounded-full bg-blue-100 p-3">
                <AtSign className="size-10 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold">No mentions yet</h2>
              <p className="text-sm text-muted-foreground">
                When someone mentions you, it will appear here
              </p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-gray-100 p-3">
                <Filter className="size-10 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold">No {activeTab} mentions</h2>
              <p className="text-sm text-muted-foreground">
                Try checking other categories
              </p>
            </>
          )}
        </div>
      ) : (
        mentionsList?.map((mention: any) => (
          <Link
            key={mention.id}
            href={getSourceLink(mention)}
            onClick={() => onOpenChange(false)}
            className={`block p-4 transition-colors hover:bg-gray-50 ${!mention.read ? 'bg-blue-50' : ''} relative group`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={mention.author.image} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {mention.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{mention.author.name}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>{formatRelativeTime(mention.timestamp)}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                    {getSourceIcon(mention.source.type)}
                    <span>{mention.source.name}</span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-3">{mention.text}</p>

                {/* No status indicator dot - using background color instead */}

                {/* Read/Unread toggle button at the bottom */}
                <div className="flex justify-end mt-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation
                      e.stopPropagation(); // Prevent event bubbling
                      handleToggleReadStatus(mention.id as Id<'mentions'>, mention.read);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-medium rounded px-2.5 py-1.5 transition-colors ${mention.read
                      ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
                      : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                  >
                    {mention.read ? (
                      <>
                        <Eye className="size-3.5" />
                        Mark as unread
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        Mark as read
                      </>
                    )}
                  </button>
                </div>

                {/* Border separator below the button */}
                <div className="border-t mt-2"></div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden shadow-lg">
        <DialogHeader className="p-5 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <Bell className="size-5 text-blue-600" />
              </div>
              <span>Notifications</span>
              {unreadCounts.all > 0 && (
                <Badge variant="default" className="ml-2 bg-blue-500 hover:bg-blue-600">
                  {unreadCounts.all} new
                </Badge>
              )}
            </DialogTitle>
          </div>
          {unreadCounts.all > 0 && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle2 className="size-3.5" />
                Mark all as read
              </Button>
            </div>
          )}
          <DialogDescription className="text-muted-foreground mt-1">
            View and manage your mentions across channels, direct messages, and boards
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-[300px] w-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
              <Loader className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your mentions...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-4 py-3 bg-gray-50">
              <TabsList className="grid w-full grid-cols-5 p-1 bg-gray-100">
                <TabsTrigger value="all" className="relative py-1.5 data-[state=active]:bg-white">
                  <div className="flex items-center gap-1.5">
                    <Filter className="size-3.5" />
                    <span>All</span>
                  </div>
                  {unreadCounts.all > 0 && (
                    <Badge variant="default" className="absolute -top-2 right-0 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 shadow-sm">
                      {unreadCounts.all}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="unread" className="relative py-1.5 data-[state=active]:bg-white">
                  <div className="flex items-center gap-1.5">
                    <Bell className="size-3.5" />
                    <span>Unread</span>
                  </div>
                  {unreadCounts.all > 0 && (
                    <Badge variant="default" className="absolute -top-2 right-0 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 shadow-sm">
                      {unreadCounts.all}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="channel" className="relative py-1.5 data-[state=active]:bg-white">
                  <div className="flex items-center gap-1.5">
                    <Hash className="size-3.5 text-blue-500" />
                    <span>Channel</span>
                  </div>
                  {unreadCounts.channel > 0 && (
                    <Badge variant="default" className="absolute -top-2 right-0 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 shadow-sm">
                      {unreadCounts.channel}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="direct" className="relative py-1.5 data-[state=active]:bg-white">
                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-green-500" />
                    <span>Direct</span>
                  </div>
                  {unreadCounts.direct > 0 && (
                    <Badge variant="default" className="absolute -top-2 right-0 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 shadow-sm">
                      {unreadCounts.direct}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="card" className="relative py-1.5 data-[state=active]:bg-white">
                  <div className="flex items-center gap-1.5">
                    <LayoutGrid className="size-3.5 text-amber-500" />
                    <span>Cards</span>
                  </div>
                  {unreadCounts.card > 0 && (
                    <Badge variant="default" className="absolute -top-2 right-0 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 shadow-sm">
                      {unreadCounts.card}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="p-0 focus:outline-none">
              {renderMentionsList(filteredMentions)}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
