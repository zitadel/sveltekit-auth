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
 *
 * @public
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
 *
 * @public
 */
export type RequestEvent = {
  request: Request;
  url: URL;
  locals: Record<string, unknown>;
};

/**
 * Auth.js configuration for SvelteKit applications.
 *
 * @public
 */
export type SvelteKitAuthConfig = Omit<AuthConfig, 'raw'>;

/**
 * Either a static {@link SvelteKitAuthConfig} object or a request-scoped
 * factory `(event) => SvelteKitAuthConfig`.
 *
 * The factory form defers config evaluation until request time, which keeps
 * server-only imports out of any code path the bundler can reach from a
 * client entry point. Useful when reading config from request-scoped env
 * (Cloudflare Workers, Deno Deploy) rather than from `process.env`.
 *
 * @public
 */
export type SvelteKitAuthConfigOrFactory =
  | SvelteKitAuthConfig
  | ((event: RequestEvent) => SvelteKitAuthConfig);

/**
 * Creates a SvelteKit auth handler.
 *
 * Accepts either a {@link SvelteKitAuthConfig} object or a request-scoped
 * factory `(event) => SvelteKitAuthConfig`. The factory form defers config
 * evaluation to request time, which keeps server-only imports off any
 * client-reachable graph.
 *
 * @param rawConfig - Auth.js configuration object or factory function
 * @returns Object containing a `handle` hook, plus `signIn` and `signOut` helpers
 *
 * @example
 * ```ts
 * // src/lib/auth/auth.ts — object form
 * import { SvelteKitAuth } from '@zitadel/sveltekit-auth';
 * import Zitadel from '@auth/core/providers/zitadel';
 *
 * export const { handle, signIn, signOut } = SvelteKitAuth({
 *   providers: [Zitadel({ ... })],
 *   secret: process.env.AUTH_SECRET,
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/lib/auth/auth.ts — factory form (request-scoped env)
 * import { SvelteKitAuth } from '@zitadel/sveltekit-auth';
 *
 * export const { handle, signIn, signOut } = SvelteKitAuth((event) => ({
 *   providers: [Zitadel({
 *     clientId: event.request.headers.get('x-zitadel-client-id') ?? '',
 *   })],
 *   secret: process.env.AUTH_SECRET,
 * }));
 * ```
 *
 * @example
 * ```ts
 * // src/hooks.server.ts
 * import { handle } from '$lib/auth/auth';
 * export { handle };
 * ```
 *
 * @public
 */
export function SvelteKitAuth(rawConfig: SvelteKitAuthConfigOrFactory): {
  handle: Handle;
  signIn: (
    provider?: string,
    options?: { redirectTo?: string },
  ) => Promise<Response>;
  signOut: (options?: { redirectTo?: string }) => Promise<Response>;
} {
  function resolveConfig(event: RequestEvent): SvelteKitAuthConfig {
    const c = typeof rawConfig === 'function' ? rawConfig(event) : rawConfig;
    c.basePath ??= '/api/auth';
    setEnvDefaults(process.env, c);
    return c;
  }

  function defaultBasePath(): string {
    if (typeof rawConfig === 'function') return '/api/auth';
    return (rawConfig.basePath ?? '/api/auth').replace(/\/$/, '');
  }

  const handle: Handle = async ({ event, resolve }) => {
    const config = resolveConfig(event as RequestEvent);
    const bp = (config.basePath ?? '/api/auth').replace(/\/$/, '');
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
    const basePath = defaultBasePath();
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    const url = provider
      ? `${basePath}/signin/${provider}${paramStr ? `?${paramStr}` : ''}`
      : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  async function signOut(
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    const basePath = defaultBasePath();
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    const url = `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;
    return Response.redirect(url, 302);
  }

  return { handle, signIn, signOut };
}

/**
 * Retrieves the current session on the server side.
 *
 * @param event - The SvelteKit RequestEvent
 * @param config - Auth.js configuration
 * @returns The session object or null
 *
 * @example
 * ```ts
 * import { getSession } from '@zitadel/sveltekit-auth';
 * import { authOptions } from '$lib/auth/auth';
 *
 * const session = await getSession(event, authOptions);
 * ```
 *
 * @public
 */
export async function getSession(
  event: RequestEvent,
  config: SvelteKitAuthConfig,
): Promise<Session | null> {
  config.basePath ??= '/api/auth';
  setEnvDefaults(process.env, config);

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
