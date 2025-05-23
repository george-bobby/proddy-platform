'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Add TypeScript declaration for Tidio Chat API
declare global {
  interface Window {
    tidioChatApi?: {
      hide: () => void;
      show: () => void;
      open: () => void;
      on: (event: string, callback: () => void) => void;
      isOpen: () => boolean;
    };
  }
}

// List of public routes where Tidio should be visible by default
const PUBLIC_ROUTES = [
  '/home',
  '/about',
  '/contact',
  '/features',
  '/pricing',
  '/why-proddy',
  '/' // Root path
];

export const TidioChat = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Function to initialize Tidio when it's ready
    const handleTidioChatApiReady = () => {
      // Check if current path is in the list of public routes
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
      );

      // Hide chat widget on non-public routes
      if (!isPublicRoute && window.tidioChatApi) {
        window.tidioChatApi.hide();
      }

      // We don't hide the widget when closed anymore
      // This allows the icon to remain visible after closing the chat
    };

    // Check if Tidio is already loaded
    if (window.tidioChatApi) {
      window.tidioChatApi.on("ready", handleTidioChatApiReady);
    } else {
      // If not loaded yet, add event listener for when it's ready
      document.addEventListener("tidioChat-ready", handleTidioChatApiReady);
    }

    // Cleanup function
    return () => {
      document.removeEventListener("tidioChat-ready", handleTidioChatApiReady);
    };
  }, [pathname]);

  // Use Next.js public environment variable for Tidio key
  const tidioKey = process.env.NEXT_PUBLIC_TIDIO_KEY;

  return (
    <Script
      id="tidio-chat"
      src={`//code.tidio.co/${tidioKey}.js`}
      strategy="lazyOnload"
    />
  );
};
