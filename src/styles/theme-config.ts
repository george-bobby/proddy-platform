/**
 * Theme Configuration
 * This file contains the theme configuration for the application
 * Use these values consistently across the application
 */

export const themeConfig = {
	// Primary brand color: Pink (#ec108c)
	primary: {
		main: 'hsl(326, 86%, 50%)', // #ec108c
		light: 'hsl(326, 86%, 60%)', // #f03da3
		dark: 'hsl(326, 86%, 40%)', // #c00975
		hover: 'hsl(326, 86%, 45%)', // #d60980
		foreground: 'hsl(0, 0%, 100%)', // #ffffff
	},

	// Secondary brand color: Coral (#f9865a)
	secondary: {
		main: 'hsl(17, 93%, 66%)', // #f9865a
		light: 'hsl(17, 93%, 76%)', // #fba683
		dark: 'hsl(17, 93%, 56%)', // #f76631
		hover: 'hsl(17, 93%, 61%)', // #f87545
		foreground: 'hsl(0, 0%, 100%)', // #ffffff
	},

	// Tertiary brand color: Deep Purple (#4a0d67)
	tertiary: {
		main: 'hsl(280, 77%, 23%)', // #4a0d67
		light: 'hsl(280, 77%, 33%)', // #6b1395
		dark: 'hsl(280, 77%, 18%)', // #390a50
		hover: 'hsl(280, 77%, 20%)', // #410b5b
		foreground: 'hsl(0, 0%, 100%)', // #ffffff
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
