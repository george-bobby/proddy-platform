import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { PropsWithChildren } from 'react';

import { ConvexClientProvider } from '@/config/convex-client-provider';
import { JotaiProvider } from '@/components/jotai-provider';
import { ModalProvider } from '@/components/modal-provider';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config';

import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = siteConfig;

const RootLayout = ({ children }: Readonly<PropsWithChildren>) => {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body className={`${poppins.className} antialiased`}>
          <ConvexClientProvider>
            <JotaiProvider>
              <Toaster theme="light" richColors closeButton />
              <ModalProvider />

              {children}
            </JotaiProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
};

export default RootLayout;
