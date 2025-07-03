'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Share, Save, Download, Maximize2, Minimize2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LiveParticipants } from './live-participants';
import { cn } from '@/lib/utils';

interface LiveHeaderProps {
  // Common props
  type: 'notes' | 'canvas';
  
  // Title props
  title?: string;
  onTitleChange?: (title: string) => void;
  isEditingTitle?: boolean;
  
  // Action props
  onSave?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onCreateItem?: () => void;
  hasUnsavedChanges?: boolean;
  
  // Search props (mainly for notes)
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  
  // Fullscreen props (mainly for canvas)
  toggleFullScreen?: () => void;
  isFullScreen?: boolean;
  showFullScreenToggle?: boolean;
  
  // Styling
  className?: string;
}

export const LiveHeader = ({
  type,
  title,
  onTitleChange,
  isEditingTitle = false,
  onSave,
  onShare,
  onExport,
  onCreateItem,
  hasUnsavedChanges = false,
  searchQuery = '',
  onSearchChange,
  showSearch = false,
  toggleFullScreen,
  isFullScreen = false,
  showFullScreenToggle = false,
  className
}: LiveHeaderProps) => {
  const [localTitle, setLocalTitle] = useState(title || '');
  const [isEditing, setIsEditing] = useState(isEditingTitle);

  useEffect(() => {
    setLocalTitle(title || '');
  }, [title]);

  const handleTitleSubmit = () => {
    if (onTitleChange && localTitle.trim()) {
      onTitleChange(localTitle.trim());
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setLocalTitle(title || '');
      setIsEditing(false);
    }
  };

  return (
    <div className={cn(
      "border-b bg-white p-4 flex items-center justify-between gap-4",
      className
    )}>
      {/* Left Section - Title and Metadata */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Title */}
        {title !== undefined && (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleTitleKeyDown}
                  className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-lg font-semibold text-left truncate hover:text-primary transition-colors"
                  title="Click to edit title"
                >
                  {title || `Untitled ${type === 'notes' ? 'Note' : 'Canvas'}`}
                </button>
              )}

              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved
                </Badge>
              )}
            </div>

            {/* Metadata row - similar to notes page */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Created Jul 3, 2025, 12:54 PM</span>
              <span>•</span>
              <span>Updated Jul 3, 2025, 03:28 PM</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Create Button */}
        {onCreateItem && (
          <Button onClick={onCreateItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            New {type === 'notes' ? 'Note' : 'Canvas'}
          </Button>
        )}

        {/* Save Button */}
        {onSave && (
          <Button
            onClick={onSave}
            size="sm"
            variant={hasUnsavedChanges ? "default" : "outline"}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}

        {/* Fullscreen Toggle */}
        {showFullScreenToggle && toggleFullScreen && (
          <Button onClick={toggleFullScreen} size="sm" variant="outline">
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Live Participants */}
        <div className="flex items-center">
          <LiveParticipants
            variant={type}
            isFullScreen={isFullScreen}
            className="flex items-center"
          />
        </div>
      </div>
    </div>
  );
};
