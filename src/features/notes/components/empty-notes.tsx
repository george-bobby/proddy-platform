'use client';

import { FileText, Plus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmptyNotesProps {
  onCreate: () => void;
  onCreateFolder?: () => void;
}

export const EmptyNotes = ({ onCreate, onCreateFolder }: EmptyNotesProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <FileText className="h-20 w-20 text-muted-foreground mb-6" />
      <h2 className="text-2xl font-semibold mb-3">No notes yet</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Start by creating a note or a folder to organize your thoughts and information.
      </p>

      <div className="flex gap-4">
        <Button onClick={onCreate} size="lg" className="gap-2">
          <FileText className="h-5 w-5" />
          Create Note
        </Button>

        {onCreateFolder && (
          <Button onClick={onCreateFolder} size="lg" variant="outline" className="gap-2">
            <FolderPlus className="h-5 w-5" />
            Create Folder
          </Button>
        )}
      </div>
    </div>
  );
};
