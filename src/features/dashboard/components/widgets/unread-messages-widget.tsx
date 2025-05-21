'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, Clock, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useGetDirectMessages } from '@/features/messages/api/use-get-direct-messages';
import { useGetUnreadDirectMessagesCount } from '@/features/messages/api/use-get-unread-direct-messages-count';
import { useMarkDirectMessageAsRead } from '@/features/messages/api/use-mark-direct-message-as-read';
import { useMarkAllDirectMessagesAsRead } from '@/features/messages/api/use-mark-all-direct-messages-as-read';
import { formatDistanceToNow } from 'date-fns';

interface UnreadMessagesWidgetProps {
  workspaceId: Id<'workspaces'>;
  member: {
    _id: Id<'members'>;
    userId: Id<'users'>;
    role: string;
    workspaceId: Id<'workspaces'>;
    user?: {
      name: string;
      image?: string;
    };
  };
}

// No need for a separate interface as we're using typeof messages[0]

export const UnreadMessagesWidget = ({ workspaceId }: UnreadMessagesWidgetProps) => {
  const router = useRouter();
  const { data: rawMessages, isLoading } = useGetDirectMessages(false); // false to get only unread
  const { counts, isLoading: countsLoading } = useGetUnreadDirectMessagesCount();
  const markAsRead = useMarkDirectMessageAsRead();
  const markAllAsRead = useMarkAllDirectMessagesAsRead();

  // Filter out messages with invalid data
  const messages = rawMessages ? rawMessages.filter(message =>
    message !== undefined &&
    message !== null &&
    message.id !== undefined &&
    message.source.type === 'direct'
  ) : [];

  const handleViewMessage = (message: typeof messages[0]) => {
    // Mark as read
    markAsRead(message.messageId);

    // Navigate to conversation
    if (message.source.type === 'direct') {
      router.push(`/workspace/${workspaceId}/conversation/${message.source.id as Id<'conversations'>}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Extract plain text from message body (which might be rich text)
  const getMessagePreview = (text: string) => {
    try {
      // If it's JSON (rich text), try to extract plain text
      const parsed = JSON.parse(text);
      if (parsed.ops) {
        return parsed.ops
          .map((op: { insert?: string | object }) => (typeof op.insert === 'string' ? op.insert : ''))
          .join('')
          .trim()
          .substring(0, 50);
      }
      return text.substring(0, 50);
    } catch (e) {
      // If not JSON, just return the string
      return text.substring(0, 50);
    }
  };

  if (isLoading || countsLoading) {
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
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Unread Direct Messages</h3>
          {counts && counts.total > 0 && (
            <Badge variant="default" className="ml-2">
              {counts.total}
            </Badge>
          )}
        </div>
        {counts && counts.total > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {messages && messages.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {messages.map((message) => (
              <Card key={message.id.toString()} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.author.image}
                        alt={message.author.name || 'User avatar'}
                      />
                      <AvatarFallback>
                        {message.author.name ? message.author.name.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{message.author.name || 'Unknown User'}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {(() => {
                            try {
                              // Try to safely format the date
                              if (message.timestamp && !isNaN(Number(message.timestamp))) {
                                const date = new Date(Number(message.timestamp));
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
                      <p className="text-sm text-muted-foreground">
                        {getMessagePreview(message.text)}
                        {message.text.length > 50 ? '...' : ''}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full justify-start text-primary"
                        onClick={() => handleViewMessage(message)}
                      >
                        View conversation
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
          <MessageSquare className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No unread messages</h3>
          <p className="text-sm text-muted-foreground">
            You're all caught up!
          </p>
        </div>
      )}
    </div>
  );
};
