'use client';

import { CalendarIcon } from 'lucide-react';

import { GenericInfo } from '@/components/workspace/generic-info';
import { WorkspaceHeader } from '../workspace-toolbar';

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
