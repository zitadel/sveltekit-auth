import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Middleware-protected endpoint — auth enforced by hooks.server.ts. */
export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }
  return json({ ok: true });
};
