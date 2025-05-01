'use client';

import { CalendarIcon } from 'lucide-react';

import { GenericInfo } from '@/components/workspace/generic-info';
import { WorkspaceHeader } from '@/components/workspace/workspace-header';

export const Header = () => {

  return (
    <WorkspaceHeader>
      <GenericInfo
        icon={CalendarIcon}
        title="Calendar"
      />
    </WorkspaceHeader>
  );
};
