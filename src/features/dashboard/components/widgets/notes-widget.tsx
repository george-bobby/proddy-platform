'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Plus, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useGetNotes } from '@/features/notes/api/use-get-notes';
import { useGetChannels } from '@/features/channels/api/use-get-channels';

interface NotesWidgetProps {
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

export const NotesWidget = ({ workspaceId }: NotesWidgetProps) => {
  const router = useRouter();
  const { data: channels } = useGetChannels({ workspaceId });

  // Get notes from the first channel (for simplicity)
  const firstChannelId = channels && channels.length > 0 ? channels[0]._id : undefined;
  const { data: channelNotes } = useGetNotes(workspaceId, firstChannelId);

  // Combine notes with channel info
  const allNotes = useMemo(() => {
    if (!channels || !channelNotes) return [];

    return channelNotes.map(note => {
      const channel = channels.find(c => c._id === note.channelId);
      return {
        ...note,
        channelName: channel?.name || 'Unknown Channel'
      };
    });
  }, [channels, channelNotes]);

  // Sort notes by last updated time
  const sortedNotes = useMemo(() => {
    if (!allNotes.length) return [];

    return [...allNotes]
      .sort((a, b) => {
        // First sort by pinned status (if exists)
        if ('isPinned' in a && 'isPinned' in b && a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        // Then sort by last updated time
        return b.updatedAt - a.updatedAt;
      })
      .slice(0, 10); // Limit to 10 notes
  }, [allNotes]);

  const handleViewNote = (noteId: Id<'notes'>, channelId: Id<'channels'>) => {
    router.push(`/workspace/${workspaceId}/channel/${channelId}/notes/${noteId}`);
  };

  const handleCreateNote = () => {
    // Navigate to the first channel's notes section
    if (channels && channels.length > 0) {
      router.push(`/workspace/${workspaceId}/channel/${channels[0]._id}/notes?action=create`);
    }
  };

  // View all notes button handler
  const handleViewAll = () => {
    // Navigate to the first channel's notes section
    if (channels && channels.length > 0) {
      router.push(`/workspace/${workspaceId}/channel/${channels[0]._id}/notes`);
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
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Recent Notes</h3>
          {sortedNotes.length > 0 && (
            <Badge variant="default" className="ml-2">
              {sortedNotes.length}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
            className="ml-4"
          >
            View All
          </Button>
        </div>
      </div>

      {sortedNotes.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {sortedNotes.map((note) => (
              <Card key={note._id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{note.title}</h5>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {note.channelName}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {(() => {
                        try {
                          // Define a type for Quill Delta operations
                          interface DeltaOperation {
                            insert?: string | object;
                            delete?: number;
                            retain?: number;
                            attributes?: Record<string, any>;
                          }

                          // Handle different content formats
                          if (!note.content) return 'No content';

                          // If content is already a string but not JSON
                          if (typeof note.content === 'string' && !note.content.includes('{"ops":')) {
                            return note.content.substring(0, 100);
                          }

                          // Parse JSON content
                          const contentStr = typeof note.content === 'string' ? note.content : JSON.stringify(note.content);
                          const parsed = JSON.parse(contentStr);

                          if (parsed && parsed.ops && Array.isArray(parsed.ops)) {
                            // Extract text from all insert operations
                            const plainText = parsed.ops
                              .map((op: DeltaOperation) => (typeof op.insert === 'string' ? op.insert : ''))
                              .join('')
                              .trim();

                            // Get first line or first 100 chars
                            const firstLine = plainText.split('\n')[0].trim();
                            return firstLine || 'No content';
                          }

                          return typeof note.content === 'string' ? note.content.substring(0, 100) : 'Note content';
                        } catch (e) {
                          // If parsing fails, return a fallback
                          return typeof note.content === 'string' ? note.content.substring(0, 100) : 'Note content';
                        }
                      })()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 w-full justify-start text-primary"
                      onClick={() => handleViewNote(note._id, note.channelId)}
                    >
                      View note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[250px] flex-col items-center justify-center rounded-md border bg-muted/10">
          <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-sm text-muted-foreground">
            Create notes to see them here
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleCreateNote}
          >
            Create Note <Plus className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
