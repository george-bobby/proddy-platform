declare global {
	interface Window {
		Canny: (action: string, options?: any) => any;
	}
}

export {};
