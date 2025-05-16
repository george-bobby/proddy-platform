'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface NoteTitleProps {
  title: string;
  onChange: (title: string) => void;
  autoFocus?: boolean;
}

export const NoteTitle = ({ title, onChange, autoFocus = false }: NoteTitleProps) => {
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Untitled"
      className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
      autoFocus={autoFocus}
    />
  );
};
