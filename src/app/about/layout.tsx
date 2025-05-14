'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function AboutLayout({ children }: PropsWithChildren) {
  // Set document title for the about page
  useDocumentTitle('About Us');
  
  return <>{children}</>;
}
