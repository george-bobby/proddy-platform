import { useEffect } from 'react';

/**
 * Hook to disable scroll bounce (elastic scrolling) on the page
 * Useful for canvas applications where you want to prevent the page from bouncing
 * when the user reaches the edge of the canvas
 */
export const useDisableScrollBounce = () => {
  useEffect(() => {
    // Save the original styles
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalTouchAction = document.documentElement.style.touchAction;

    // Disable scroll bounce
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.documentElement.style.touchAction = 'none';

    // Restore original styles on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.documentElement.style.touchAction = originalTouchAction;
    };
  }, []);
};
