'use client';

import { useEffect } from 'react';

export const HotjarAnalytics = () => {
  useEffect(() => {
    // Only initialize in production and when not blocked
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const initializeHotjar = async () => {
      try {
        const { default: Hotjar } = await import('@hotjar/browser');

        const siteId = Number(process.env.NEXT_PUBLIC_HOTJAR_SITE_ID);
        const hotjarVersion = 6;

        // Initialize Hotjar with error handling
        Hotjar.init(siteId, hotjarVersion);
      } catch (error) {
        // Silently handle errors (e.g., when blocked by ad blockers)
        // Don't log to console to avoid polluting user's console
      }
    };

    initializeHotjar();
  }, []);

  // This component doesn't render anything visible
  return null;
};
