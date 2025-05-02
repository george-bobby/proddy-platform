'use client';

import { useRouter } from 'next/navigation';
import { navigateWithoutReload } from './navigation-utils';

// Add a global click handler for mentions
export const setupGlobalMentionHandler = (): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  // Check if the handler is already set up
  if ((window as any).__mentionHandlerSetup) return;

  // Mark that we've set up the handler
  (window as any).__mentionHandlerSetup = true;

  // Add a global click handler
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Check if the clicked element is a mention or a child of a mention
    const mention = target.closest('.user-mention');

    if (mention) {
      e.preventDefault();
      e.stopPropagation();

      // Get the member ID and workspace ID
      const memberId = mention.getAttribute('data-member-id');
      const workspaceId = mention.getAttribute('data-workspace-id');

      if (memberId && workspaceId) {
        // Navigate to the member's profile using client-side navigation
        const url = `/workspace/${workspaceId}/member/${memberId}`;
        console.log('Navigating to:', url);

        // Use our utility function for navigation
        navigateWithoutReload(url);
      }
    }
  });
};

// Hook for use within React components
export const useMentionNavigation = () => {
  const router = useRouter();

  const navigateToMemberProfile = (memberId: string, workspaceId: string) => {
    const url = `/workspace/${workspaceId}/member/${memberId}`;
    console.log('Navigating to:', url);

    // Try to use the router first for proper client-side navigation
    try {
      router.push(url);
    } catch (error) {
      console.error('Router navigation failed, falling back to history API:', error);
      navigateWithoutReload(url);
    }
  };

  return { navigateToMemberProfile };
};
