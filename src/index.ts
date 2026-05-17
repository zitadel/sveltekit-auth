import {
  Auth,
  type AuthConfig,
  setEnvDefaults,
  createActionURL,
} from '@auth/core';
import type { Session } from '@auth/core/types';

export { AuthError, CredentialsSignin } from '@auth/core/errors';
export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from '@auth/core/types';

/**
 * SvelteKit Handle type — compatible with @sveltejs/kit.
 */
export type Handle = (input: {
  event: {
    request: Request;
    url: URL;
    locals: Record<string, unknown>;
  };
  resolve: (event: {
    request: Request;
    url: URL;
    locals: Record<string, unknown>;
  }) => Promise<Response>;
}) => Promise<Response>;

/**
 * SvelteKit RequestEvent type.
 */
export type RequestEvent = {
  request: Request;
  url: URL;
  locals: Record<string, unknown>;
};

/**
 * Auth.js configuration for SvelteKit applications.
 */
export type SvelteKitAuthConfig = Omit<AuthConfig, 'raw'>;

/**
 * Creates a SvelteKit auth handler.
 *
 * @param config - Auth.js configuration
 * @returns Object containing a `handle` hook, plus `signIn` and `signOut` helpers
 *
 * @example
 * ```ts
 * // src/lib/auth/auth.ts
 * import { SvelteKitAuth } from '@zitadel/sveltekit-auth';
 * import Zitadel from '@auth/core/providers/zitadel';
 *
 * export const { handle, signIn, signOut } = SvelteKitAuth({
 *   providers: [Zitadel({ ... })],
 *   secret: process.env.AUTH_SECRET,
 * });
 * ```
 */
export function SvelteKitAuth(config: SvelteKitAuthConfig): {
  handle: Handle;
  signIn: (
    provider?: string,
    options?: { redirectTo?: string },
  ) => Promise<Response>;
  signOut: (options?: { redirectTo?: string }) => Promise<Response>;
} {
  config.basePath ??= '/auth';
  setEnvDefaults(process.env, config);

  const bp = config.basePath.replace(/\/$/, '');

  const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith(bp + '/')) {
      const response = await Auth(event.request, config);
      return response;
    }
    return resolve(event);
  };

  async function signIn(
    provider?: string,
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    const url = provider
      ? `${bp}/signin/${provider}${paramStr ? `?${paramStr}` : ''}`
      : `${bp}/signin${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  async function signOut(
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    return Response.redirect(
      `${bp}/signout${paramStr ? `?${paramStr}` : ''}`,
      302,
    );
  }

  return { handle, signIn, signOut };
}

/**
 * Retrieves the current session on the server side.
 *
 * @param event - The SvelteKit RequestEvent
 * @param config - Auth.js configuration
 * @returns The session object or null
 */
export async function getSession(
  event: RequestEvent,
  config: SvelteKitAuthConfig,
): Promise<Session | null> {
  setEnvDefaults(process.env, config);
  config.basePath ??= '/auth';

  const url = createActionURL(
    'session',
    event.url.protocol.slice(0, -1) as 'http' | 'https',
    new Headers(event.request.headers),
    process.env,
    config,
  );

  const response = await Auth(
    new Request(url, {
      headers: { cookie: event.request.headers.get('cookie') ?? '' },
    }),
    config,
  );

  const { status } = response;
  const data = (await response.json()) as Record<string, unknown> | null;
  if (!data || !Object.keys(data).length) return null;
  if (status === 200) return data as unknown as Session;
  throw new Error((data as { message?: string }).message ?? 'Session error');
}
