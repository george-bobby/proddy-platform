'use client';

import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyNotesProps {
  onCreate: () => void;
}

export const EmptyNotes = ({ onCreate }: EmptyNotesProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <FileText className="h-20 w-20 text-muted-foreground mb-6" />
      <h2 className="text-2xl font-semibold mb-3">No notes yet</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Start by creating a note to organize your thoughts and information.
      </p>

      <Button onClick={onCreate} size="lg" className="gap-2">
        <FileText className="h-5 w-5" />
        Create Note
      </Button>
    </div>
  );
};
