/**
 * Routes that don't require authentication and should silently ignore 401 errors
 * These routes work without any auth - 401s are swallowed completely
 */
export const SILENT_401_ROUTES: readonly string[] = [
  '/docs',
] as const;

/**
 * Auth routes where 401 should be passed through to the component
 * (so login form can show "invalid credentials" etc.)
 */
export const AUTH_ROUTES: readonly string[] = [
  '/login',
  '/register',
] as const;

/**
 * Check if 401 should be silently ignored (page works without auth)
 * @param url - Current URL path
 * @returns true if 401 should be swallowed
 */
export function shouldIgnore401(url: string): boolean {
  return SILENT_401_ROUTES.some(route => url.startsWith(route));
}

/**
 * Check if this is an auth route (login/register)
 * 401 on these routes should be passed through, not redirect
 * @param url - Current URL path
 * @returns true if this is an auth route
 */
export function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some(route => url.startsWith(route));
}
