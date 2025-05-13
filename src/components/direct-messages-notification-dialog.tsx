'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AtSign, CheckCircle2, MessageSquare, CheckCheck, Eye } from 'lucide-react';
import Link from 'next/link';

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
import { useGetDirectMessages } from '@/features/messages/api/use-get-direct-messages';
import { useMarkDirectMessageAsRead } from '@/features/messages/api/use-mark-direct-message-as-read';
import { useMarkAllDirectMessagesAsRead } from '@/features/messages/api/use-mark-all-direct-messages-as-read';
import { Id } from '@/../convex/_generated/dataModel';
import { Badge } from './ui/badge';

interface DirectMessagesNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DirectMessagesNotificationDialog = ({
  open,
  onOpenChange,
}: DirectMessagesNotificationDialogProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: directMessages, isLoading } = useGetDirectMessages(true); // Get all direct messages
  const markDirectMessageAsRead = useMarkDirectMessageAsRead();
  const markAllAsReadMutation = useMarkAllDirectMessagesAsRead();
  const [activeTab, setActiveTab] = useState('all');

  const handleMarkAsRead = async (messageId: Id<'messages'>, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markDirectMessageAsRead(messageId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation();
  };

  // Filter messages based on the active tab
  const filteredMessages = directMessages?.filter((message: any) => {
    if (activeTab === 'unread') {
      return !message.read;
    }
    return true;
  });

  // Count unread messages
  const unreadCount = directMessages?.filter((message: any) => !message.read).length || 0;

  // Get the conversation link for a direct message
  const getConversationLink = (message: any) => {
    if (!workspaceId) return '#';
    return `/workspace/${workspaceId}/member/${message.author.id}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-xl">Direct Messages</DialogTitle>
          <DialogDescription>
            Messages sent directly to you
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="all" className="relative py-1.5 data-[state=active]:bg-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="relative py-1.5 data-[state=active]:bg-white">
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="absolute -top-2 right-0 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 shadow-sm">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all as read
              </Button>
            </div>

            <TabsContent value={activeTab} className="p-0 focus:outline-none">
              <div className="divide-y max-h-[450px] overflow-y-auto">
                {filteredMessages?.length === 0 ? (
                  <div className="flex h-[250px] w-full flex-col items-center justify-center gap-y-3 bg-gray-50">
                    {activeTab === 'unread' ? (
                      <>
                        <div className="rounded-full bg-green-100 p-3">
                          <CheckCircle2 className="size-10 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold">All caught up!</h2>
                        <p className="text-sm text-muted-foreground">
                          You have no unread direct messages
                        </p>
                      </>
                    ) : activeTab === 'all' ? (
                      <>
                        <div className="rounded-full bg-blue-100 p-3">
                          <MessageSquare className="size-10 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold">No direct messages yet</h2>
                        <p className="text-sm text-muted-foreground">
                          When someone sends you a direct message, it will appear here
                        </p>
                      </>
                    ) : null}
                  </div>
                ) : (
                  filteredMessages?.map((message: any) => (
                    <Link
                      key={message.id}
                      href={getConversationLink(message)}
                      onClick={() => onOpenChange(false)}
                      className={`block p-4 transition-colors hover:bg-gray-50 ${!message.read ? 'bg-blue-50' : ''} relative group`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={message.author.image} />
                          <AvatarFallback className="bg-secondary/10 text-secondary font-medium">
                            {message.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm flex items-center">
                              {message.author.name}
                              <span className="ml-2 text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            {!message.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleMarkAsRead(message.messageId, e)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
