'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  member: any;
}

export const UnreadMessagesWidget = ({ workspaceId, member }: UnreadMessagesWidgetProps) => {
  const router = useRouter();
  const { data: rawMessages, isLoading } = useGetDirectMessages(false); // false to get only unread
  const { counts, isLoading: countsLoading } = useGetUnreadDirectMessagesCount();
  const markAsRead = useMarkDirectMessageAsRead();
  const markAllAsRead = useMarkAllDirectMessagesAsRead();

  // Filter out messages with invalid data
  const messages = rawMessages ? rawMessages.filter(message =>
    message &&
    message._id &&
    message.conversationId
  ) : [];

  const handleViewMessage = (conversationId: Id<'conversations'>, messageId: Id<'messages'>) => {
    // Mark as read
    markAsRead(messageId);

    // Navigate to conversation
    router.push(`/workspace/${workspaceId}/conversation/${conversationId}`);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Extract plain text from message body (which might be rich text)
  const getMessagePreview = (body: string) => {
    try {
      // If it's JSON (rich text), try to extract plain text
      const parsed = JSON.parse(body);
      if (parsed.ops) {
        return parsed.ops
          .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
          .join('')
          .trim()
          .substring(0, 50);
      }
      return body.substring(0, 50);
    } catch (e) {
      // If not JSON, just return the string
      return body.substring(0, 50);
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
              <Card key={message._id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.sender?.image}
                        alt={message.sender?.name || 'User avatar'}
                      />
                      <AvatarFallback>
                        {message.sender?.name ? message.sender.name.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{message.sender?.name || 'Unknown User'}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {(() => {
                            try {
                              // Try to safely format the date
                              if (message._creationTime && !isNaN(Number(message._creationTime))) {
                                const date = new Date(Number(message._creationTime));
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
                        {getMessagePreview(message.body)}
                        {message.body.length > 50 ? '...' : ''}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full justify-start text-primary"
                        onClick={() => handleViewMessage(message.conversationId, message._id)}
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
