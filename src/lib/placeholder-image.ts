/**
 * Generate a data URL for a placeholder image with initials
 * @param text - The text/initials to display
 * @param width - Width of the image (default: 40)
 * @param height - Height of the image (default: 40)
 * @param bgColor - Background color (default: '#4f46e5')
 * @param textColor - Text color (default: '#ffffff')
 * @returns Data URL for the generated image
 */
export function generatePlaceholderImage(
	text: string,
	width: number = 40,
	height: number = 40,
	bgColor: string = '#4f46e5',
	textColor: string = '#ffffff'
): string {
	// For server-side rendering or when canvas is not available, use SVG fallback
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return generateSVGPlaceholder(text, width, height, bgColor, textColor);
	}

	try {
		// Create a canvas element
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return generateSVGPlaceholder(text, width, height, bgColor, textColor);
		}

		// Fill background
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);

		// Draw text
		ctx.fillStyle = textColor;
		ctx.font = `bold ${Math.floor(height * 0.4)}px Arial, sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, width / 2, height / 2);

		return canvas.toDataURL();
	} catch (error) {
		// Fallback to SVG if canvas fails
		return generateSVGPlaceholder(text, width, height, bgColor, textColor);
	}
}

/**
 * Generate an SVG-based placeholder image
 */
function generateSVGPlaceholder(
	text: string,
	width: number = 40,
	height: number = 40,
	bgColor: string = '#4f46e5',
	textColor: string = '#ffffff'
): string {
	const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="${textColor}" font-family="Arial, sans-serif" font-size="${Math.floor(height * 0.4)}" font-weight="bold">${text}</text>
    </svg>
  `.trim();

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
	if (!name) return 'U'; // Default for "User"

	const parts = name.trim().split(' ');
	if (parts.length === 1) {
		return parts[0].charAt(0).toUpperCase();
	}

	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get a placeholder image URL for a user
 * @param name - User's name (optional)
 * @param imageUrl - User's actual image URL (optional)
 * @returns Image URL to use
 */
export function getUserImageUrl(name?: string, imageUrl?: string): string {
	if (imageUrl) {
		return imageUrl;
	}

	const initials = getInitials(name || 'User');
	return generatePlaceholderImage(initials);
}
