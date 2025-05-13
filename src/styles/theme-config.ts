/**
 * Theme Configuration
 * This file contains the theme configuration for the application
 * Use these values consistently across the application
 */

export const themeConfig = {
	// Colors
	primary: {
		main: 'hsl(280, 77%, 25%)', // Slightly lighter for visibility: #541075
		light: 'hsl(280, 77%, 35%)', // #7118a2
		dark: 'hsl(280, 77%, 20%)', // #3f0c5c
		hover: 'hsl(280, 77%, 28%)', // #5b1281
		foreground: 'hsl(0, 0%, 100%)', // White
	},
	secondary: {
		main: 'hsl(326, 86%, 52%)', // Slightly lighter base: #ee2d96
		light: 'hsl(326, 86%, 62%)', // More usable light tone: #f359a9
		dark: 'hsl(326, 86%, 42%)', // Better contrast dark: #c81a7c
		hover: 'hsl(326, 86%, 47%)', // Hover state between base & dark: #db1387
		foreground: 'hsl(0, 0%, 100%)', // White
	},

	// Border radius
	radius: {
		small: '6px',
		medium: '10px',
		large: '12px',
		round: '9999px',
	},

	// Animation durations
	duration: {
		fast: '150ms',
		normal: '200ms',
		slow: '300ms',
	},

	// Shadows
	shadow: {
		sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
	},
};
