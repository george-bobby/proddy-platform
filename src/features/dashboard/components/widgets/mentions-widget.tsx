'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AtSign, CheckCircle, Clock, Hash, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useGetMentionedMessages } from '@/features/messages/api/use-get-mentioned-messages';
import { useGetUnreadMentionsCount } from '@/features/messages/api/use-get-unread-mentions-count';
import { useMarkMentionAsRead } from '@/features/messages/api/use-mark-mention-as-read';
import { useMarkAllMentionsAsRead } from '@/features/messages/api/use-mark-all-mentions-as-read';
import { formatDistanceToNow } from 'date-fns';

interface MentionsWidgetProps {
  workspaceId: Id<'workspaces'>;
  member: any;
}

export const MentionsWidget = ({ workspaceId, member }: MentionsWidgetProps) => {
  const router = useRouter();
  const { data: rawMentions, isLoading } = useGetMentionedMessages(false); // false to get only unread
  const { counts, isLoading: countsLoading } = useGetUnreadMentionsCount();
  const markAsRead = useMarkMentionAsRead();
  const markAllAsRead = useMarkAllMentionsAsRead();

  // Filter out mentions with invalid data
  const mentions = rawMentions ? rawMentions.filter(mention =>
    mention &&
    mention._id
  ) : [];

  const handleViewMention = (mention: any) => {
    // Mark as read
    markAsRead(mention._id);

    // Navigate based on mention type
    if (mention.channelId) {
      router.push(`/workspace/${workspaceId}/channel/${mention.channelId}/chats`);
    } else if (mention.conversationId) {
      router.push(`/workspace/${workspaceId}/conversation/${mention.conversationId}`);
    }
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
          <AtSign className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Mentions</h3>
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

      {mentions && mentions.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {mentions.map((mention) => (
              <Card key={mention._id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={mention.author?.image}
                        alt={mention.author?.name || 'User avatar'}
                      />
                      <AvatarFallback>
                        {mention.author?.name ? mention.author.name.charAt(0).toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{mention.author?.name || 'Unknown User'}</p>
                          {mention.channelId && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {mention.channelName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {(() => {
                            try {
                              // Try to safely format the date
                              if (mention._creationTime && !isNaN(Number(mention._creationTime))) {
                                const date = new Date(Number(mention._creationTime));
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
                        {getMessagePreview(mention.message.body)}
                        {mention.message.body.length > 50 ? '...' : ''}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full justify-start text-primary"
                        onClick={() => handleViewMention(mention)}
                      >
                        View mention
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
          <AtSign className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No mentions</h3>
          <p className="text-sm text-muted-foreground">
            You haven't been mentioned recently
          </p>
        </div>
      )}
    </div>
  );
};
