/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = withPWA({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === 'development',
	customWorkerDir: 'worker',
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'google-fonts',
				expiration: {
					maxEntries: 20,
					maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
				},
			},
		},
		{
			urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-font-assets',
				expiration: {
					maxEntries: 20,
					maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
				},
			},
		},
		{
			urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-image-assets',
				expiration: {
					maxEntries: 64,
					maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
				},
			},
		},
		{
			urlPattern: /\/_next\/image\?url=.+$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'next-image',
				expiration: {
					maxEntries: 64,
					maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
				},
			},
		},
		{
			urlPattern: /\.(?:mp3|wav|ogg)$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'static-audio-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
				},
			},
		},
		{
			urlPattern: /\.(?:mp4|webm)$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'static-video-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
				},
			},
		},
		{
			urlPattern: /\.(?:js)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-js-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
				},
			},
		},
		{
			urlPattern: /\.(?:css|less)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-style-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
				},
			},
		},
		{
			urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'next-data',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60, // 1 hour
				},
			},
		},
		{
			urlPattern: /\/api\/.*$/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'apis',
				expiration: {
					maxEntries: 16,
					maxAgeSeconds: 60 * 60, // 1 hour
				},
				networkTimeoutSeconds: 10, // fall back to cache if api doesn't respond within 10 seconds
			},
		},
		{
			urlPattern: /.*/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'others',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60, // 1 hour
				},
				networkTimeoutSeconds: 10,
			},
		},
	],
})({
	images: {
		domains: ['getstream.io'],
	},
});

export default nextConfig;
