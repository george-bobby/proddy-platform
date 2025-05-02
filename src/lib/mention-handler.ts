import type { Id } from '@/../convex/_generated/dataModel';
import { navigateWithoutReload } from './navigation-utils';

// Function to create a mention HTML element with an onclick attribute
export const createMentionElement = (memberId: Id<'members'>, memberName: string, workspaceId: string): string => {
  // Create a unique ID for this mention
  const mentionId = `mention-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Create the HTML with data attributes and target="_self" to ensure it opens in the same tab
  return `<a
    href="/workspace/${workspaceId}/member/${memberId}"
    id="${mentionId}"
    class="user-mention"
    data-member-id="${memberId}"
    data-workspace-id="${workspaceId}"
    target="_self"
    style="color: #6366f1; font-weight: bold; cursor: pointer; text-decoration: none;">@${memberName}</a>`;
};

// Function to add click handlers to mentions in a container
export const addMentionClickHandlers = (container: HTMLElement): void => {
  // Find all mention elements
  const mentions = container.querySelectorAll('.user-mention');

  // Add click handlers to each mention
  mentions.forEach(mention => {
    const memberId = mention.getAttribute('data-member-id');
    const workspaceId = mention.getAttribute('data-workspace-id');

    if (memberId && workspaceId) {
      // Remove any existing click handlers
      const oldElement = mention;
      const newElement = oldElement.cloneNode(true);
      if (oldElement.parentNode) {
        oldElement.parentNode.replaceChild(newElement, oldElement);
      }

      // Add a new click handler
      newElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Log the navigation
        console.log('Mention clicked, navigating to:', `/workspace/${workspaceId}/member/${memberId}`);

        // Use our utility function for navigation
        const url = `/workspace/${workspaceId}/member/${memberId}`;
        navigateWithoutReload(url);
      });
    }
  });
};
