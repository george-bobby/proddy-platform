'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function FeaturesLayout({ children }: PropsWithChildren) {
  // Set document title for the features page
  useDocumentTitle('Features');
  
  return <>{children}</>;
}
