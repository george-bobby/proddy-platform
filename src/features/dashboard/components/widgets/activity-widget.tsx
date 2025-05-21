'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  MessageSquare,
  FileText,
  CheckSquare,
  Calendar,
  Clock,
  Hash,
  Users,
  PlusCircle,
  Pencil,
  Trash2,
  AtSign,
  Loader
} from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';

interface ActivityWidgetProps {
  workspaceId: Id<'workspaces'>;
  member: any;
}

type ActivityItem = {
  id: string;
  type: 'message' | 'note' | 'task' | 'event' | 'channel' | 'member' | 'mention';
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'joined';
  title: string;
  author: {
    name: string;
    image?: string;
  };
  timestamp: number;
  channelId?: Id<'channels'>;
  channelName?: string;
  entityId?: string;
};

export const ActivityWidget = ({ workspaceId, member }: ActivityWidgetProps) => {
  const router = useRouter();

  // Get recent activity data
  const recentMessages = useQuery(api.messages.getUserMessages, { workspaceId });
  const recentTasks = useQuery(api.tasks.getTasks, { workspaceId });

  // Combine all activity into a single timeline
  const activityItems: ActivityItem[] = [];

  // Add messages to activity
  if (recentMessages) {
    recentMessages.forEach((message) => {
      // Get author name - in Convex, member data is populated separately
      // We don't have direct access to user data on the message object
      const authorName = 'User'; // Default fallback

      // Ensure we have a valid timestamp
      const timestamp = message._creationTime && !isNaN(message._creationTime)
        ? message._creationTime
        : Date.now();

      // Parse message body to extract plain text
      let messageText = '';
      try {
        // Try to parse as JSON (Quill Delta format)
        const parsedBody = JSON.parse(message.body);
        if (parsedBody.ops) {
          messageText = parsedBody.ops
            .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
            .join('')
            .trim()
            .substring(0, 50);
        } else {
          messageText = message.body.substring(0, 50);
        }
      } catch (e) {
        // If not JSON, just use the string directly
        messageText = message.body.substring(0, 50);
      }

      activityItems.push({
        id: message._id,
        type: 'message',
        action: 'created',
        title: messageText + (messageText.length > 50 ? '...' : ''),
        author: {
          name: authorName,
          // Don't try to access message.user.image as it doesn't exist
          image: undefined,
        },
        timestamp: timestamp,
        channelId: message.channelId,
        channelName: message.context?.name || 'General',
      });
    });
  }

  // Add tasks to activity
  if (recentTasks) {
    recentTasks.forEach((task) => {
      // Ensure we have a valid timestamp
      const timestamp = task._creationTime || Date.now();

      activityItems.push({
        id: task._id,
        type: 'task',
        action: task.completed ? 'completed' : 'created',
        title: task.title,
        author: {
          name: member?.user?.name || 'You',
          image: member?.user?.image,
        },
        timestamp: timestamp,
      });
    });
  }

  // Filter out any items with invalid data and sort by timestamp (newest first)
  const sortedActivity = activityItems
    .filter(item =>
      item &&
      item.author &&
      item.timestamp &&
      !isNaN(item.timestamp) &&
      new Date(item.timestamp).toString() !== 'Invalid Date'
    ) // Ensure we have valid items with author data and valid timestamps
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'task':
        return action === 'completed'
          ? <CheckSquare className="h-4 w-4 text-green-500" />
          : <CheckSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'channel':
        return <Hash className="h-4 w-4" />;
      case 'member':
        return <Users className="h-4 w-4" />;
      case 'mention':
        return <AtSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <PlusCircle className="h-3 w-3" />;
      case 'updated':
        return <Pencil className="h-3 w-3" />;
      case 'deleted':
        return <Trash2 className="h-3 w-3" />;
      case 'completed':
        return <CheckSquare className="h-3 w-3" />;
      case 'joined':
        return <Users className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActivityText = (item: ActivityItem) => {
    switch (item.type) {
      case 'message':
        return item.channelName ? `posted in ${item.channelName}` : 'posted a message';
      case 'note':
        return `${item.action} a note`;
      case 'task':
        return item.action === 'completed' ? 'completed a task' : 'created a task';
      case 'event':
        return `${item.action} an event`;
      case 'channel':
        return `${item.action} a channel`;
      case 'member':
        return `${item.action === 'joined' ? 'joined' : item.action} the workspace`;
      case 'mention':
        return 'mentioned you';
      default:
        return `${item.action} a ${item.type}`;
    }
  };

  const handleViewActivity = (item: ActivityItem) => {
    switch (item.type) {
      case 'message':
        if (item.channelId) {
          router.push(`/workspace/${workspaceId}/channel/${item.channelId}/chats`);
        }
        break;
      case 'task':
        router.push(`/workspace/${workspaceId}/tasks?taskId=${item.id}`);
        break;
      case 'note':
        router.push(`/workspace/${workspaceId}/notes/${item.id}`);
        break;
      case 'event':
        router.push(`/workspace/${workspaceId}/calendar?eventId=${item.id}`);
        break;
      default:
        break;
    }
  };

  if (!recentMessages || !recentTasks) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pr-8"> {/* Added padding-right to avoid overlap with drag handle */}
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Recent Activity</h3>
        </div>
      </div>

      {sortedActivity.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {sortedActivity.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={item.author?.image}
                        alt={item.author?.name || 'User avatar'}
                      />
                      <AvatarFallback>
                        {item.author?.name && item.author.name !== 'Unknown User'
                          ? item.author.name.charAt(0).toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.author?.name || 'Unknown User'}</p>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getActivityIcon(item.type, item.action)}
                            <span className="ml-1">{getActivityText(item)}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {(() => {
                            try {
                              // Try to safely format the date
                              if (item.timestamp && !isNaN(Number(item.timestamp))) {
                                const date = new Date(Number(item.timestamp));
                                if (date.toString() !== 'Invalid Date') {
                                  return formatDistanceToNow(date, { addSuffix: true });
                                }
                              }
                              return 'recently';
                            } catch (error) {
                              return 'recently';
                            }
                          })()}
                        </div>
                      </div>
                      <p className="text-sm">{item.title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full justify-start text-primary"
                        onClick={() => handleViewActivity(item)}
                      >
                        View details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[250px] flex-col items-center justify-center rounded-md border bg-muted/10">
          <Activity className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No recent activity</h3>
          <p className="text-sm text-muted-foreground">
            Your workspace activity will appear here
          </p>
        </div>
      )}
    </div>
  );
};
