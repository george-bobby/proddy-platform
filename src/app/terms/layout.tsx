'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function TermsLayout({ children }: PropsWithChildren) {
  // Set document title for the terms page
  useDocumentTitle('Terms of Service');
  
  return <>{children}</>;
}
