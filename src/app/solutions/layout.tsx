'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function SolutionsLayout({ children }: PropsWithChildren) {
  // Set document title for the solutions page
  useDocumentTitle('Solutions');
  
  return <>{children}</>;
}
