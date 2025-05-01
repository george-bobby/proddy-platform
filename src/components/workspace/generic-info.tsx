'use client';

import { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface GenericInfoProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

export const GenericInfo = ({ 
  icon: Icon, 
  title, 
  onClick 
}: GenericInfoProps) => {
  return (
    <Button
      variant="ghost"
      className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
      size="sm"
      onClick={onClick}
    >
      <Icon className="mr-2 size-5" />
      <span className="truncate">{title}</span>
    </Button>
  );
};
