# SvelteKit Auth.js

A [SvelteKit](https://svelte.dev/docs/kit/introduction) integration for
[Auth.js](https://authjs.dev/) that provides seamless authentication with
multiple providers, session management, and SvelteKit-native hook patterns.

This integration brings the power and flexibility of Auth.js to SvelteKit
applications with full TypeScript support, SSR-friendly HTTP handling,
and SvelteKit-native patterns including server hooks and load functions.

### Why?

Modern web applications require robust, secure, and flexible authentication
systems. While Auth.js provides excellent authentication capabilities,
integrating it with SvelteKit applications requires careful consideration of
framework patterns, server-side rendering, and TypeScript integration.

However, a direct integration isn't always straightforward. Different types
of applications or deployment scenarios might warrant different approaches:

- **Hook Integration:** Auth.js operates at the HTTP level, while SvelteKit
  uses server hooks (`hooks.server.ts`) and load functions. A proper integration
  should bridge this gap by providing a `handle` hook that intercepts auth
  routes and populates `event.locals` transparently.
- **HTTP Request Handling:** SvelteKit's hooks receive `RequestEvent` objects.
  This integration handles the protocol bridging so Auth.js and SvelteKit's
  request lifecycle work seamlessly together.
- **Session and Request Lifecycle:** Proper session handling in SvelteKit
  requires SSR-friendly utilities that work across server-rendered pages and
  client interactions, compatible with `+page.server.ts` load functions.
- **Route Protection:** Many applications need fine-grained authorization
  beyond simple authentication. `getSession()` provides a clean server-side
  primitive for protecting routes and layouts.

This integration, `@zitadel/sveltekit-auth`, aims to provide the flexibility
to handle such scenarios. It allows you to leverage the full Auth.js ecosystem
while maintaining SvelteKit best practices, ultimately leading to a more
effective and less burdensome authentication implementation.

## Installation

Install using NPM by using the following command:

```sh
npm install @zitadel/sveltekit-auth @auth/core
```

## Usage

To use this integration, call `SvelteKitAuth()` and export the resulting
`handle` hook from `hooks.server.ts`. Auth routes are served at
`/api/auth/*` by default.

First, create your auth configuration:

```ts
// src/lib/auth/auth.ts
import { SvelteKitAuth } from '@zitadel/sveltekit-auth';
import Zitadel from '@auth/core/providers/zitadel';

export const { handle } = SvelteKitAuth({
  providers: [
    Zitadel({
      clientId: process.env.ZITADEL_CLIENT_ID,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET,
      issuer: process.env.ZITADEL_DOMAIN,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
```

Then export the hook:

```ts
// src/hooks.server.ts
export { handle } from '$lib/auth/auth';
```

#### Using the Authentication System

The integration provides several functions and hooks for handling
authentication:

**Server Utilities:**

- `SvelteKitAuth(config)`: Creates the `{ handle }` hook
- `getSession(event, config)`: Retrieves the current session in load functions

**Client Exports** (from `@zitadel/sveltekit-auth/client`):

- `signIn(provider?, options?)`: Client helper for sign-in
- `signOut(options?)`: Client helper for sign-out

**Basic Usage in a Load Function:**

```ts
// src/routes/+page.server.ts
import { getSession } from '@zitadel/sveltekit-auth';
import { authConfig } from '$lib/auth/auth';

export async function load(event) {
  const session = await getSession(event, authConfig);
  return { session };
}
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  export let data;
</script>

{#if data.session}
  <p>Welcome, {data.session.user?.name}</p>
  <button on:click={() => import('@zitadel/sveltekit-auth/client').then(m => m.signOut())}>
    Sign out
  </button>
{:else}
  <button on:click={() => import('@zitadel/sveltekit-auth/client').then(m => m.signIn('zitadel'))}>
    Sign in
  </button>
{/if}
```

Prefer a dedicated sign-in page? Use the client helpers directly:

```svelte
<!-- src/routes/signin/+page.svelte -->
<script lang="ts">
  import { signIn } from '@zitadel/sveltekit-auth/client';
</script>

<button on:click={() => signIn('zitadel')}>Sign in with ZITADEL</button>
```

##### Example: Advanced Configuration with Multiple Providers

This example shows how to use the integration with multiple Auth.js
providers and custom session configuration:

```ts
// src/lib/auth/auth.ts
import { SvelteKitAuth } from '@zitadel/sveltekit-auth';
import Zitadel from '@auth/core/providers/zitadel';
import Google from '@auth/core/providers/google';

export const { handle } = SvelteKitAuth({
  providers: [
    Zitadel({
      clientId: process.env.ZITADEL_CLIENT_ID,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET,
      issuer: process.env.ZITADEL_DOMAIN,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).roles = (user as any).roles;
      return token;
    },
    async session({ session, token }) {
      (session.user as any).roles = (token as any).roles as
        | string[]
        | undefined;
      return session;
    },
  },
});
```

## Known Issues

- **Auth Base Path:** By default, auth routes are served at `/api/auth/*`,
  matching the convention used by the other Zitadel SDK families. Configure
  `basePath` in your `SvelteKitAuth` options if you need a different path.
- **Environment Configuration:** The integration relies on `AUTH_SECRET` and,
  in many hosting scenarios, `AUTH_TRUST_HOST`. Ensure these are correctly set
  in your environment for production.
- **Callback URLs:** OAuth providers must be configured with the correct
  callback URL: `[origin]/api/auth/callback/[provider]`.
- **Type Augmentation:** If you attach additional properties (e.g., roles) to
  the Auth.js user object, extend your app's types accordingly so consumers of
  `session.user` remain type-safe.
- **Redirect Semantics:** OAuth providers expect real browser navigations during
  sign-in. The client helpers handle this for you — avoid manual `fetch()` calls
  to provider endpoints unless you know you need credential/email flows.

## Useful links

- **[Auth.js](https://authjs.dev/):** The authentication library that this
  integration is built upon.
- **[SvelteKit](https://svelte.dev/docs/kit/introduction):** The framework
  this integration targets.
- **[Auth.js Providers](https://authjs.dev/getting-started/providers):**
  Complete list of supported authentication providers.

## Contributing

If you have suggestions for how this integration could be improved, or
want to report a bug, open an issue — we'd love all and any contributions.

## License

Apache-2.0
