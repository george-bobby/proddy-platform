'use client';

import { ArrowLeft, Menu, Plus, Share, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { TestNavigation } from '@/app/test/components/test-navigation';

interface TestNotesHeaderProps {
  selectedNote?: {
    id: string;
    title: string;
    tags: string[];
    isShared: boolean;
    collaborators: string[];
    updatedAt: Date;
  } | null;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onCreateNote: () => void;
}

export const TestNotesHeader = ({
  selectedNote,
  onToggleSidebar,
  sidebarCollapsed,
  onCreateNote,
}: TestNotesHeaderProps) => {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/test/dashboard');
  };

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation and note info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Notes</h1>
            <Badge variant="secondary" className="text-xs">
              Demo
            </Badge>
          </div>

          {selectedNote && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium">{selectedNote.title}</span>
              </div>

              {selectedNote.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <div className="flex gap-1">
                    {selectedNote.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {selectedNote.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedNote.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {selectedNote.isShared && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">
                    {selectedNote.collaborators.length} collaborator{selectedNote.collaborators.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="text-xs">
                Updated {selectedNote.updatedAt.toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Navigation and actions */}
        <div className="flex items-center gap-4">
          <TestNavigation variant="compact" />

          <div className="flex items-center gap-2">
            {selectedNote?.isShared && (
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
