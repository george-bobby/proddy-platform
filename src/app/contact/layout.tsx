'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function ContactLayout({ children }: PropsWithChildren) {
  // Set document title for the contact page
  useDocumentTitle('Contact Us');
  
  return <>{children}</>;
}
