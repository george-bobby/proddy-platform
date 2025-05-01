'use client';

import { Mail } from 'lucide-react';

import { GenericInfo } from '@/components/workspace/generic-info';
import { WorkspaceHeader } from '@/components/workspace-toolbar';

export const Header = () => {
  return (
    <WorkspaceHeader>
      <GenericInfo
        icon={Mail}
        title="Outbox"
      />
    </WorkspaceHeader>
  );
};
