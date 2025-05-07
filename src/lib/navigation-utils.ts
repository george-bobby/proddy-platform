'use client';

// Function to navigate to a URL without reloading the page or opening a new tab
export const navigateWithoutReload = (url: string): void => {
  // Use history.pushState for same-tab navigation without page reload
  history.pushState({}, '', url);

  // Dispatch a popstate event to trigger route change
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
};
