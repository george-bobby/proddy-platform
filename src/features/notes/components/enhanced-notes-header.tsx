'use client';

import { Plus, Share, Users, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Note } from '../types';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { useRoom, useOthers } from '@/../liveblocks.config';

interface EnhancedNotesHeaderProps {
  selectedNote?: Note | null;
  onCreateNote: () => void;
  workspaceId: Id<'workspaces'>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const EnhancedNotesHeader = ({
  selectedNote,
  onCreateNote,
  workspaceId,
  searchQuery,
  onSearchChange,
}: EnhancedNotesHeaderProps) => {
  const members = useQuery(api.members.get, { workspaceId }) || [];
  const room = useRoom();
  const others = useOthers();

  // Optionally, filter members to only those present in the room (by userId)
  // const presentUserIds = new Set(others.map(o => o.id));
  // const presentMembers = members.filter(m => presentUserIds.has(m.user._id));  // For now, show all members

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="border-b bg-muted/30">
      {/* Collaborators Section */}
      {members.length > 0 && (
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Collaborators</span>
            </div>
            <div className="flex items-center gap-2">
              {members.slice(0, 4).map((member: any, index: number) => (
                <div key={index} className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {member.name}
                  </span>
                </div>
              ))}
              {members.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{members.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* Left side - Note info and search */}
          <div className="flex items-center gap-4 flex-1">
            {selectedNote ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{selectedNote.title}</span>
                </div>

                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <div className="flex gap-1">
                      {selectedNote.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-0 h-5">
                          {tag}
                        </Badge>
                      ))}
                      {selectedNote.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                          +{selectedNote.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Updated {formatDate(selectedNote.updatedAt)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes by title, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {selectedNote && (
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}

            <Button onClick={onCreateNote} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
