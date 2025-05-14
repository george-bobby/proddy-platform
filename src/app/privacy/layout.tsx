'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function PrivacyLayout({ children }: PropsWithChildren) {
  // Set document title for the privacy page
  useDocumentTitle('Privacy Policy');
  
  return <>{children}</>;
}
