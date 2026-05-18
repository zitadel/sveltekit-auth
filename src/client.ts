/**
 * Client-side sign-in helper for SvelteKit applications.
 *
 * @param provider - The provider ID to sign in with
 * @param options - Sign-in options
 *
 * @public
 */
export async function signIn(
  provider?: string,
  options: { callbackUrl?: string; redirect?: boolean } = {},
): Promise<void> {
  const basePath = '/auth';
  const params = new URLSearchParams();
  if (options.callbackUrl) {
    params.set('callbackUrl', options.callbackUrl);
  }
  const paramStr = params.toString();
  const url = provider
    ? `${basePath}/signin/${provider}${paramStr ? `?${paramStr}` : ''}`
    : `${basePath}/signin${paramStr ? `?${paramStr}` : ''}`;

  if (options.redirect === false) {
    return;
  }
  window.location.href = url;
}

/**
 * Client-side sign-out helper for SvelteKit applications.
 *
 * @param options - Sign-out options
 *
 * @public
 */
export async function signOut(
  options: { callbackUrl?: string; redirect?: boolean } = {},
): Promise<void> {
  const basePath = '/auth';
  const params = new URLSearchParams();
  if (options.callbackUrl) {
    params.set('callbackUrl', options.callbackUrl);
  }
  const paramStr = params.toString();
  const url = `${basePath}/signout${paramStr ? `?${paramStr}` : ''}`;

  if (options.redirect === false) {
    return;
  }
  window.location.href = url;
}
