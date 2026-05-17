import { handle as authHandle } from '$lib/auth/auth';
import { authConfig } from '$lib/auth/auth';
import { getSession } from '@zitadel/sveltekit-auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const conditionalAuth: Handle = async ({ event, resolve }) => {
  if (event.url.pathname === '/api/auth/logout/callback') {
    return resolve(event);
  }
  // Set event.locals.auth so layout load functions can call it to get the session
  event.locals.auth = () => getSession(event as Parameters<typeof getSession>[0], authConfig);
  return authHandle({ event, resolve } as Parameters<typeof authHandle>[0]);
};

// noinspection JSUnusedGlobalSymbols
export const handle = sequence(conditionalAuth, async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});
