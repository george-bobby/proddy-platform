'use client';

import { FaChevronDown } from 'react-icons/fa';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface MemberInfoProps {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

export const MemberInfo = ({ 
  memberName = 'Member', 
  memberImage, 
  onClick 
}: MemberInfoProps) => {
  const avatarFallback = memberName.charAt(0).toUpperCase();

  return (
    <Button
      variant="ghost"
      className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
      size="sm"
      onClick={onClick}
    >
      <Avatar className="mr-3 size-7">
        <AvatarImage src={memberImage} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>

      <span className="truncate">{memberName}</span>
      <FaChevronDown className="ml-2 size-2.5 transition-transform duration-200 group-hover:rotate-180" />
    </Button>
  );
};
