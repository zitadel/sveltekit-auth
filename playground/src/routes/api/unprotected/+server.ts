import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Public endpoint — accessible without authentication. */
export const GET: RequestHandler = async () => {
  return json({ ok: true });
};
