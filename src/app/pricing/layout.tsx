'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PropsWithChildren } from 'react';

export default function PricingLayout({ children }: PropsWithChildren) {
  // Set document title for the pricing page
  useDocumentTitle('Pricing');
  
  return <>{children}</>;
}
