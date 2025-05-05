'use client';

import { AtSign, Hash, Loader, MessageSquare, Trello, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceToolbar } from '../toolbar';
import { useGetMentionedMessages } from '@/features/messages/api/use-get-mentioned-messages';
import { useMarkMentionAsRead } from '@/features/messages/api/use-mark-mention-as-read';
import { useMarkAllMentionsAsRead } from '@/features/messages/api/use-mark-all-mentions-as-read';
import { Id } from '@/../convex/_generated/dataModel';

// We'll use the interface from the API directly
export default function MentionsPage() {
  const workspaceId = useWorkspaceId();
  const { data: mentions, isLoading } = useGetMentionedMessages(true); // Get all mentions, including read ones
  const markMentionAsRead = useMarkMentionAsRead();
  const markAllAsReadMutation = useMarkAllMentionsAsRead();

  const handleMarkAsRead = async (mentionId: Id<'mentions'>) => {
    await markMentionAsRead(mentionId);
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

  const getSourceIcon = (type: 'channel' | 'direct' | 'thread' | 'card') => {
    switch (type) {
      case 'channel':
        return <Hash className="h-3.5 w-3.5" />;
      case 'direct':
        return <User className="h-3.5 w-3.5" />;
      case 'thread':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'card':
        return <Trello className="h-3.5 w-3.5" />;
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

  const unreadMentions = mentions?.filter((m) => !m.read) || [];
  const allMentions = mentions || [];

  const renderMentionsList = (mentionsList: typeof mentions) => (
    <div className="divide-y">
      {mentionsList?.map((mention) => (
        <div
          key={mention.id}
          className={`p-4 transition-colors hover:bg-muted/20 ${!mention.read ? 'bg-primary/5' : ''}`}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={mention.author.image} />
              <AvatarFallback>{mention.author.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium">{mention.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(mention.timestamp)}
                </span>
                <div className="ml-auto flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {getSourceIcon(mention.source.type)}
                  <span>{mention.source.name}</span>
                </div>
              </div>
              <p className="text-sm">{mention.text}</p>
              <div className="flex gap-2 pt-1">
                <Link
                  href={getSourceLink(mention)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {mention.source.type === 'card' ? 'View board' : 'View conversation'}
                </Link>
                {!mention.read && (
                  <button
                    onClick={() => handleMarkAsRead(mention.id as Id<'mentions'>)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
            size="sm"
          >
            <AtSign className="mr-2 size-5" />
            <span className="truncate">Mentions</span>
          </Button>

          {unreadMentions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </WorkspaceToolbar>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-6 py-2">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  Unread
                  {unreadMentions.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {unreadMentions.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-0">
              {allMentions.length > 0 ? (
                renderMentionsList(allMentions)
              ) : (
                <div className="flex h-[300px] w-full flex-col items-center justify-center gap-y-2 bg-white">
                  <AtSign className="size-12 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">No mentions</h2>
                  <p className="text-sm text-muted-foreground">You haven't been mentioned yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="p-0">
              {unreadMentions.length > 0 ? (
                renderMentionsList(unreadMentions)
              ) : (
                <div className="flex h-[300px] w-full flex-col items-center justify-center gap-y-2 bg-white">
                  <AtSign className="size-12 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">No unread mentions</h2>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
