'use client';

import { useEffect } from 'react';
import Hotjar from '@hotjar/browser';

export const HotjarAnalytics = () => {
  useEffect(() => {
    // Initialize Hotjar with your site ID and version
    const siteId = 6413729;
    const hotjarVersion = 6;

    // Initialize Hotjar
    Hotjar.init(siteId, hotjarVersion);
  }, []);

  // This component doesn't render anything visible
  return null;
};
