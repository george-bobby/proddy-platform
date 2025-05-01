'use client';

import { MessageSquareText } from 'lucide-react';

import { GenericInfo } from '@/components/workspace/generic-info';
import { WorkspaceHeader } from '@/components/workspace-toolbar';

export const Header = () => {
  return (
    <WorkspaceHeader>
      <GenericInfo
        icon={MessageSquareText}
        title="Threads"
      />
    </WorkspaceHeader>
  );
};
