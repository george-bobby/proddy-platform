'use client';

// Function to debug mentions in the document
export const debugMentions = (): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  console.log('Debugging mentions...');
  
  // Find all mention elements
  const mentions = document.querySelectorAll('.user-mention');
  
  console.log(`Found ${mentions.length} mentions in the document`);
  
  // Log each mention
  mentions.forEach((mention, index) => {
    const memberId = mention.getAttribute('data-member-id');
    const workspaceId = mention.getAttribute('data-workspace-id');
    const href = (mention as HTMLAnchorElement).href;
    
    console.log(`Mention ${index + 1}:`, {
      element: mention,
      memberId,
      workspaceId,
      href,
      tagName: mention.tagName,
      className: mention.className,
      innerHTML: mention.innerHTML,
      outerHTML: mention.outerHTML,
    });
    
    // Test click handler
    console.log(`Testing click handler for mention ${index + 1}...`);
    
    // Add a temporary click handler for testing
    mention.addEventListener('click', (e) => {
      console.log(`Mention ${index + 1} clicked!`, e);
    }, { once: true });
  });
  
  // Add a global click handler for debugging
  document.addEventListener('click', (e) => {
    console.log('Document clicked:', e);
    console.log('Target:', e.target);
    console.log('Current target:', e.currentTarget);
    
    // Check if the clicked element is a mention or a child of a mention
    const mention = (e.target as HTMLElement).closest('.user-mention');
    
    if (mention) {
      console.log('Mention clicked:', mention);
    }
  }, { once: true });
  
  console.log('Debug setup complete. Click on a mention to test.');
};
