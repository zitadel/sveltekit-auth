import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Protected endpoint — returns 403 when the request is unauthenticated. */
export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  return json({ ok: true });
};
