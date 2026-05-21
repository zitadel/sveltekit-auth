import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';

// Node.js's Response.redirect rejects relative URLs, so we mock it to
// capture the URL and return a proper 302 response for assertions.
beforeEach(() => {
  jest.spyOn(Response, 'redirect').mockImplementation(
    (url: string | URL, status?: number) =>
      new Response(null, {
        status: status ?? 302,
        headers: { location: String(url) },
      }),
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SvelteKit Auth Package', () => {
  describe('Main Entry Point Exports', () => {
    it('should export SvelteKitAuth as a function', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      expect(SvelteKitAuth).toBeDefined();
      expect(typeof SvelteKitAuth).toBe('function');
    });

    it('should export getSession as a function', async () => {
      const { getSession } = await import('../src/index.js');

      expect(getSession).toBeDefined();
      expect(typeof getSession).toBe('function');
    });

    it('should export AuthError', async () => {
      const { AuthError } = await import('../src/index.js');

      expect(AuthError).toBeDefined();
    });

    it('should export CredentialsSignin', async () => {
      const { CredentialsSignin } = await import('../src/index.js');

      expect(CredentialsSignin).toBeDefined();
    });
  });

  describe('SvelteKitAuth factory return shape', () => {
    it('should return an object with handle, signIn, and signOut properties', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const result = SvelteKitAuth({ providers: [], secret: 'test-secret' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('handle');
      expect(result).toHaveProperty('signIn');
      expect(result).toHaveProperty('signOut');
    });

    it('should not return handlers, GET, POST, getSession, or auth properties', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const result = SvelteKitAuth({ providers: [], secret: 'test-secret' });

      expect(result).not.toHaveProperty('handlers');
      expect(result).not.toHaveProperty('GET');
      expect(result).not.toHaveProperty('POST');
      expect(result).not.toHaveProperty('auth');
    });

    it('should return handle as a function', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { handle } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });

      expect(typeof handle).toBe('function');
    });

    it('should return signIn as a function', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });

      expect(typeof signIn).toBe('function');
    });

    it('should return signOut as a function', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signOut } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });

      expect(typeof signOut).toBe('function');
    });
  });

  describe('signIn URL construction with default basePath /api/auth', () => {
    it('should redirect to /api/auth/signin/{provider} when provider is given', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signIn('zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin/zitadel');
    });

    it('should redirect to /api/auth/signin when no provider is given', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signIn();

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin');
    });

    it('should append callbackUrl as redirectTo query param', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signIn('zitadel', { redirectTo: '/dashboard' });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/api/auth/signin/zitadel?callbackUrl=%2Fdashboard',
      );
    });

    it('should append redirectTo without provider', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signIn(undefined, { redirectTo: '/home' });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/api/auth/signin?callbackUrl=%2Fhome',
      );
    });

    it('should not append query string when redirectTo is not provided', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signIn('zitadel', {});

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signin/zitadel');
    });
  });

  describe('signOut URL construction with default basePath /api/auth', () => {
    it('should redirect to /api/auth/signout', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signOut } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signOut();

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signout');
    });

    it('should append callbackUrl as redirectTo query param on signOut', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signOut } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signOut({ redirectTo: '/' });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/api/auth/signout?callbackUrl=%2F',
      );
    });

    it('should not append query string when redirectTo is not provided', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signOut } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
      });
      const response = await signOut({});

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/api/auth/signout');
    });
  });

  describe('Custom basePath support', () => {
    it('should use custom basePath in signIn URL', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
        basePath: '/custom-auth',
      });
      const response = await signIn('zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/custom-auth/signin/zitadel',
      );
    });

    it('should use custom basePath in signOut URL', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signOut } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
        basePath: '/custom-auth',
      });
      const response = await signOut();

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/custom-auth/signout');
    });

    it('should strip trailing slash from custom basePath', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
        basePath: '/custom-auth/',
      });
      const response = await signIn('zitadel');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/custom-auth/signin/zitadel',
      );
    });

    it('should use custom basePath with redirectTo in signIn URL', async () => {
      const { SvelteKitAuth } = await import('../src/index.js');

      const { signIn } = SvelteKitAuth({
        providers: [],
        secret: 'test-secret',
        basePath: '/myauth',
      });
      const response = await signIn('zitadel', { redirectTo: '/profile' });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        '/myauth/signin/zitadel?callbackUrl=%2Fprofile',
      );
    });
  });

  describe('Standalone getSession export', () => {
    it('should be a named export with 2 parameters', async () => {
      const { getSession } = await import('../src/index.js');

      expect(typeof getSession).toBe('function');
      expect(getSession.length).toBe(2);
    });
  });

  describe('Adapter Entry Point', () => {
    it('should be importable', async () => {
      const module = await import('../src/adapter.js');

      expect(module).toBeDefined();
    });
  });

  describe('Client Entry Point', () => {
    it('should export signIn function', async () => {
      const { signIn } = await import('../src/client.js');

      expect(signIn).toBeDefined();
      expect(typeof signIn).toBe('function');
    });

    it('should export signOut function', async () => {
      const { signOut } = await import('../src/client.js');

      expect(signOut).toBeDefined();
      expect(typeof signOut).toBe('function');
    });
  });
});
