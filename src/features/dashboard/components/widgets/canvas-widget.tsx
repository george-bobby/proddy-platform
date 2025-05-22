'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, Clock, Plus, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

interface CanvasWidgetProps {
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

export const CanvasWidget = ({ workspaceId }: CanvasWidgetProps) => {
  const router = useRouter();
  const { data: channels } = useGetChannels({ workspaceId });

  // Get boards from the first channel (for simplicity)
  const firstChannelId = channels && channels.length > 0 ? channels[0]._id : undefined;

  // Get all cards for the channel (we'll use these as "canvas items")
  const allCards = useQuery(
    api.board.getAllCardsForChannel,
    firstChannelId ? { channelId: firstChannelId } : 'skip'
  );

  // Combine cards with channel info
  const canvasItems = useMemo(() => {
    if (!channels || !allCards) return [];

    return allCards.map(card => {
      const channel = channels.find(c => c._id === firstChannelId);
      return {
        _id: card._id,
        title: card.title,
        description: card.description || '',
        updatedAt: card._creationTime,
        channelId: firstChannelId,
        channelName: channel?.name || 'Unknown Channel'
      };
    });
  }, [channels, allCards, firstChannelId]);

  // Sort canvas items by last updated time
  const sortedCanvasItems = useMemo(() => {
    if (!canvasItems.length) return [];

    return [...canvasItems]
      .sort((a, b) => {
        // Sort by last updated time (creation time in this case)
        return b.updatedAt - a.updatedAt;
      })
      .slice(0, 10); // Limit to 10 items
  }, [canvasItems]);

  const handleViewCanvas = (cardId: Id<'cards'>, channelId: Id<'channels'>) => {
    router.push(`/workspace/${workspaceId}/channel/${channelId}/board?cardId=${cardId}`);
  };

  const handleCreateCanvas = () => {
    // Navigate to the first channel's board section
    if (channels && channels.length > 0) {
      router.push(`/workspace/${workspaceId}/channel/${channels[0]._id}/board?action=create`);
    }
  };

  // View all canvas button handler
  const handleViewAll = () => {
    // Navigate to the first channel's board section
    if (channels && channels.length > 0) {
      router.push(`/workspace/${workspaceId}/channel/${channels[0]._id}/board`);
    }
  };

  if (!channels) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Recent Canvas</h3>
          {sortedCanvasItems.length > 0 && (
            <Badge variant="default" className="ml-2">
              {sortedCanvasItems.length}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
          >
            View All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateCanvas}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            New Canvas
          </Button>
        </div>
      </div>

      {sortedCanvasItems.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {sortedCanvasItems.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{item.title}</h5>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.channelName}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description ? item.description.substring(0, 100) : 'No description'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 w-full justify-start text-primary"
                      onClick={() => item.channelId && handleViewCanvas(item._id, item.channelId)}
                    >
                      View canvas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[250px] flex-col items-center justify-center rounded-md border bg-muted/10">
          <PenTool className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No canvas items found</h3>
          <p className="text-sm text-muted-foreground">
            Create a canvas to see it here
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleCreateCanvas}
          >
            Create Canvas <Plus className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

