'use client';

import { useEffect } from 'react';

/**
 * A hook to dynamically set the document title
 * @param title The title to set
 * @param suffix Optional suffix to append to the title (defaults to "Proddy")
 */
export const useDocumentTitle = (title: string, suffix: string = 'Proddy') => {
  useEffect(() => {
    // Set the document title
    document.title = title ? `${title} | ${suffix}` : suffix;

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
};
