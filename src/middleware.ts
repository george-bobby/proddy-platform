import {
	convexAuthNextjsMiddleware,
	createRouteMatcher,
	isAuthenticatedNextjs,
	nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';

// Define public pages that don't require authentication
const isPublicPage = createRouteMatcher(['/auth', '/']);

// Define authenticated-only pages
const isAuthenticatedOnlyPage = createRouteMatcher([
	'/workspace',
	'/workspace/*',
	'/join/:workspaceId',
]);

export default convexAuthNextjsMiddleware((req) => {
	// If trying to access authenticated-only pages without being logged in
	if (isAuthenticatedOnlyPage(req) && !isAuthenticatedNextjs()) {
		return nextjsMiddlewareRedirect(req, '/auth');
	}

	// If trying to access auth page while already logged in
	if (req.nextUrl.pathname === '/auth' && isAuthenticatedNextjs()) {
		return nextjsMiddlewareRedirect(req, '/workspace');
	}

	// If accessing the root page while authenticated, redirect to workspace
	if (req.nextUrl.pathname === '/' && isAuthenticatedNextjs()) {
		return nextjsMiddlewareRedirect(req, '/workspace');
	}
});

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
