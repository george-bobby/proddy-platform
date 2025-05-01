'use client';

import { MemberInfo } from '@/components/workspace/member-info';
import { WorkspaceHeader } from '@/components/workspace/workspace-header';

interface HeaderProps {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

export const Header = ({ memberName = 'Member', memberImage, onClick }: HeaderProps) => {
  return (
    <WorkspaceHeader>
      <MemberInfo
        memberName={memberName}
        memberImage={memberImage}
        onClick={onClick}
      />
    </WorkspaceHeader>
  );
};
