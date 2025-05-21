'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquareText, Hash, Clock, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useGetThreadMessages } from '@/features/messages/api/use-get-thread-messages';
import { formatDistanceToNow } from 'date-fns';

interface ThreadRepliesWidgetProps {
  workspaceId: Id<'workspaces'>;
  member: any;
}

export const ThreadRepliesWidget = ({ workspaceId, member }: ThreadRepliesWidgetProps) => {
  const router = useRouter();
  const rawThreadMessages = useGetThreadMessages();

  // Filter out threads with invalid data
  const threadMessages = rawThreadMessages ? rawThreadMessages.filter(thread =>
    thread &&
    thread.id &&
    thread.channelId &&
    thread.parentId
  ) : null;

  const handleViewThread = (channelId: Id<'channels'>, parentMessageId: Id<'messages'>) => {
    router.push(`/workspace/${workspaceId}/channel/${channelId}/threads/${parentMessageId}`);
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

  if (!threadMessages) {
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
          <MessageSquareText className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Thread Replies</h3>
          {threadMessages.length > 0 && (
            <Badge variant="default" className="ml-2">
              {threadMessages.length}
            </Badge>
          )}
        </div>
      </div>

      {threadMessages.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {threadMessages.map((thread) => (
              <Card key={thread.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={thread.author?.image}
                        alt={thread.author?.name || 'User avatar'}
                      />
                      <AvatarFallback>
                        {thread.author?.name ? thread.author.name.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{thread.author?.name || 'Unknown User'}</p>
                          {thread.channelName && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {thread.channelName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {(() => {
                            try {
                              // Try to safely format the date
                              if (thread.createdAt && !isNaN(Number(thread.createdAt))) {
                                const date = new Date(Number(thread.createdAt));
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
                      <div className="rounded-md bg-muted/30 p-2 text-xs">
                        <p className="font-medium text-muted-foreground">
                          Replied to your thread:
                        </p>
                        <p className="mt-1">
                          {getMessagePreview(thread.content)}
                          {thread.content.length > 50 ? '...' : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full justify-start text-primary"
                        onClick={() => handleViewThread(thread.channelId, thread.parentId)}
                      >
                        View thread
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
          <MessageSquareText className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No thread replies</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any recent thread replies
          </p>
        </div>
      )}
    </div>
  );
};
