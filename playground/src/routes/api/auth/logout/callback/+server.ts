import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// noinspection JSUnusedGlobalSymbols
/**
 * Handles the logout callback by clearing all Auth.js session cookies and
 * redirecting to the success page. Used by Playwright tests to verify cookie
 * clearing. State validation is omitted in the playground.
 */
export const GET: RequestHandler = async (event) => {
  for (const cookie of event.cookies.getAll()) {
    if (cookie.name.startsWith('authjs.')) {
      event.cookies.delete(cookie.name, { path: '/' });
    }
  }
  throw redirect(302, '/');
};
