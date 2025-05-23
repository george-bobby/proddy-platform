'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function AssistantLayout({ children }: PropsWithChildren) {
  // Set document title for the assistant page
  useDocumentTitle('Assistant');

  return <>{children}</>;
}
