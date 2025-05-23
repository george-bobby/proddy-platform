/**
 * Helper functions for interacting with the Tidio Chat API
 *
 * The Tidio Chat API is loaded from the script with the public key
 * stored in the NEXT_PUBLIC_TIDIO_KEY environment variable.
 */

/**
 * Shows and opens the Tidio chat widget if it's hidden, or hides it if it's already visible
 * This allows the help button to toggle the chat widget
 * @returns {boolean} True if the operation was successful, false otherwise
 */
export const showTidioChat = (): boolean => {
	if (typeof window === 'undefined') return false;

	if (window.tidioChatApi) {
		// Check if the chat widget is visible by checking its DOM element
		const tidioElement = document.getElementById('tidio-chat-iframe');
		const isChatVisible =
			tidioElement &&
			window.getComputedStyle(tidioElement).getPropertyValue('display') !==
				'none';

		if (isChatVisible) {
			// If chat is visible, hide it
			window.tidioChatApi.hide();
		} else {
			// If chat is hidden, show and open it
			window.tidioChatApi.show();
			window.tidioChatApi.open();
		}
		return true;
	}

	return false;
};

/**
 * Hides the Tidio chat widget
 * @returns {boolean} True if the chat was successfully hidden, false otherwise
 */
export const hideTidioChat = (): boolean => {
	if (typeof window === 'undefined') return false;

	if (window.tidioChatApi) {
		window.tidioChatApi.hide();
		return true;
	}

	return false;
};
