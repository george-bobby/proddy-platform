'use client';

import { Mail } from 'lucide-react';

import { GenericInfo } from '@/components/workspace/generic-info';
import { WorkspaceHeader } from '../workspace-toolbar';

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
