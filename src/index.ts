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
  getSession: (event: RequestEvent) => Promise<Session | null>;
  signIn: (
    provider?: string,
    options?: { redirectTo?: string },
  ) => Promise<Response>;
  signInUrl: (options?: { redirectTo?: string }) => string;
  signOut: (options?: { redirectTo?: string }) => Promise<Response>;
  signOutUrl: (options?: { redirectTo?: string }) => string;
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

  /**
   * Returns the relative URL of the sign-in endpoint, with `callbackUrl`
   * appended when `redirectTo` is provided. Useful when the framework's
   * native redirect helper takes a URL string (e.g. SvelteKit's
   * `throw redirect(302, url)`, TanStack Router's
   * `throw redirect({ href: url })`).
   */
  function signInUrl(options: { redirectTo?: string } = {}): string {
    const basePath = defaultBasePath();
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    return `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;
  }

  /**
   * Returns the relative URL of the sign-out endpoint, with `callbackUrl`
   * appended when `redirectTo` is provided.
   */
  function signOutUrl(options: { redirectTo?: string } = {}): string {
    const basePath = defaultBasePath();
    const params = new URLSearchParams();
    if (options.redirectTo) params.set('callbackUrl', options.redirectTo);
    const paramStr = params.toString();
    return `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;
  }

  async function signIn(
    provider?: string,
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    // The `provider` argument is intentionally ignored on the server side:
    // Auth.js's per-provider sign-in endpoint (/api/auth/signin/{provider})
    // requires a POST with a CSRF token, which a 302 redirect cannot
    // produce. Server-side signIn always routes through the chooser
    // (/api/auth/signin); when `pages.signIn` is configured, Auth.js then
    // bounces to the consumer's custom sign-in page (where the POST form
    // + CSRF live). The `provider` arg is kept in the signature for
    // parity with client-side signIn() callers.
    void provider;
    // Use a raw Response rather than Response.redirect(): the static
    // Response.redirect() method validates the URL and rejects relative
    // ones, but we don't have the request origin in this scope. Browsers
    // accept relative Location headers per RFC 7231 §7.1.2.
    return new Response(null, {
      status: 302,
      headers: { Location: signInUrl(options) },
    });
  }

  async function signOut(
    options: { redirectTo?: string } = {},
  ): Promise<Response> {
    return new Response(null, {
      status: 302,
      headers: { Location: signOutUrl(options) },
    });
  }

  /**
   * Bound to the factory's resolved config so callers don't need to pass
   * `authOptions` explicitly. Matches the canonical factory return shape
   * used by next-auth / remix-auth / solidstart-auth / tanstack-auth. The
   * standalone `getSession(event, config)` export remains available for
   * callers that prefer the explicit form.
   */
  async function getSessionBound(event: RequestEvent): Promise<Session | null> {
    return getSession(event, resolveConfig(event));
  }

  return {
    handle,
    getSession: getSessionBound,
    signIn,
    signInUrl,
    signOut,
    signOutUrl,
  };
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
