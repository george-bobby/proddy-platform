'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { NavigationEvent } from '@/lib/navigation-utils';

/**
 * Component that listens for custom navigation events and handles them with Next.js router
 * This allows global event handlers (like mention clicks) to trigger proper client-side navigation
 */
export const NavigationListener = () => {
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = (event: NavigationEvent) => {
      const { url } = event.detail;

      try {
        // Use Next.js router for proper client-side navigation
        router.push(url);
      } catch (error) {
        console.error('Router navigation failed:', error);
        // Fallback to window.location for same-tab navigation
        window.location.href = url;
      }
    };

    // Listen for custom navigation events
    window.addEventListener('navigate', handleNavigation as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, [router]);

  // This component doesn't render anything
  return null;
};
