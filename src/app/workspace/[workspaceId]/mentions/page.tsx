'use client';

import { AtSign, Hash, Loader, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceToolbar } from '../toolbar';

// Sample mention interface
interface Mention {
  id: string;
  text: string;
  context: string;
  timestamp: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  source: {
    type: 'channel' | 'direct' | 'thread';
    id: string;
    name: string;
  };
  read: boolean;
}

export default function MentionsPage() {
  const workspaceId = useWorkspaceId();
  const [isLoading] = useState(false);

  // Sample mentions data
  const [mentions, setMentions] = useState<Mention[]>([
    {
      id: '1',
      text: '@you Can you review the design mockups by tomorrow?',
      context: 'We need to finalize the UI before the client meeting on Friday.',
      timestamp: '2025-03-05T14:30:00Z',
      author: {
        id: 'user1',
        name: 'Sarah Williams',
        image: '/avatars/01.png'
      },
      source: {
        type: 'channel',
        id: 'channel1',
        name: 'design'
      },
      read: false
    },
    {
      id: '2',
      text: "@you I've added your suggestions to the project proposal.",
      context: 'Thanks for the feedback! Let me know if you have any other thoughts.',
      timestamp: '2025-03-04T16:45:00Z',
      author: {
        id: 'user2',
        name: 'John Doe',
        image: '/avatars/02.png'
      },
      source: {
        type: 'channel',
        id: 'channel2',
        name: 'marketing'
      },
      read: true
    },
    {
      id: '3',
      text: "@you @alex Let's schedule a meeting to discuss the new feature.",
      context: 'I think we should prioritize this for the next sprint.',
      timestamp: '2025-03-04T10:15:00Z',
      author: {
        id: 'user3',
        name: 'Michael Brown',
        image: '/avatars/03.png'
      },
      source: {
        type: 'thread',
        id: 'thread1',
        name: 'Feature Discussion'
      },
      read: true
    },
    {
      id: '4',
      text: '@you What do you think about the latest analytics report?',
      context: "The numbers look promising, but I'd like your input before sharing with the team.",
      timestamp: '2025-03-03T09:20:00Z',
      author: {
        id: 'user4',
        name: 'Emily Chen',
        image: '/avatars/04.png'
      },
      source: {
        type: 'direct',
        id: 'direct1',
        name: 'Emily Chen'
      },
      read: true
    },
    {
      id: '5',
      text: '@you @team We need to prepare for the client presentation next week.',
      context: 'Please share your slides with me by Thursday so I can compile everything.',
      timestamp: '2025-03-02T15:10:00Z',
      author: {
        id: 'user5',
        name: 'David Wilson',
        image: '/avatars/05.png'
      },
      source: {
        type: 'channel',
        id: 'channel3',
        name: 'projects'
      },
      read: true
    }
  ]);

  // Mark a mention as read
  const markAsRead = (mentionId: string) => {
    setMentions(mentions.map(mention =>
      mention.id === mentionId ? { ...mention, read: true } : mention
    ));
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Get source icon based on type
  const getSourceIcon = (type: 'channel' | 'direct' | 'thread') => {
    switch (type) {
      case 'channel':
        return <Hash className="h-3.5 w-3.5" />;
      case 'direct':
        return <User className="h-3.5 w-3.5" />;
      case 'thread':
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  // Filter mentions
  const unreadMentions = mentions.filter(mention => !mention.read);
  const allMentions = mentions;

  // Render content based on mentions
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
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
          {renderMentionsList(allMentions)}
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
    );
  };

  // Render mentions list
  const renderMentionsList = (mentionsList: Mention[]) => {
    return (
      <div className="divide-y">
        {mentionsList.map((mention) => (
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

                {mention.context && (
                  <p className="text-xs text-muted-foreground">{mention.context}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/workspace/${workspaceId}/${mention.source.type === 'channel' ? 'channel' : 'member'}/${mention.source.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View conversation
                  </Link>

                  {!mention.read && (
                    <button
                      onClick={() => markAsRead(mention.id)}
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
  };

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <AtSign className="mr-2 size-5" />
          <span className="truncate">Mentions</span>
        </Button>
      </WorkspaceToolbar>

      <div className="flex-1 overflow-y-auto bg-white">
        {mentions.length > 0 ? renderContent() : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
            <AtSign className="size-12 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Mentions</h2>
            <p className="text-sm text-muted-foreground">No mentions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
