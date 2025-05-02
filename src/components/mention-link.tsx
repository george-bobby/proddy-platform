'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import type { Id } from '@/../convex/_generated/dataModel';

interface MentionLinkProps {
  memberId: Id<'members'>;
  workspaceId: string;
  children: ReactNode;
  className?: string;
}

export const MentionLink = ({ memberId, workspaceId, children, className = '' }: MentionLinkProps) => {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `/workspace/${workspaceId}/member/${memberId}`;
    console.log('MentionLink: Navigating to', url);
    
    // Use router for client-side navigation
    router.push(url);
  };
  
  return (
    <Link 
      href={`/workspace/${workspaceId}/member/${memberId}`}
      onClick={handleClick}
      className={`user-mention ${className}`}
      data-member-id={memberId}
      data-workspace-id={workspaceId}
    >
      {children}
    </Link>
  );
};
