---
title: Quick Start
group: OAuth Provider
children:
  - ./sveltekit-auth-handler.md
  - ./session-data.md
  - ./custom-pages.md
  - ./server-side/session-access.md
  - ./server-side/rest-api.md
---

# OAuth Quick Start

This guide walks through setting up `@zitadel/sveltekit-auth` with the
OAuth provider, suitable for OAuth, magic links, and credentials sign-in.

## Installation

Install `@auth/core` alongside `@zitadel/sveltekit-auth`:

```bash
npm install @zitadel/sveltekit-auth @auth/core
```

## Configure SvelteKitAuth

Create `src/lib/auth.ts` and call the `SvelteKitAuth()` factory:

```ts
// src/lib/auth.ts
import { SvelteKitAuth } from '@zitadel/sveltekit-auth';
import GitHub from '@auth/core/providers/github';

export const { handle, getSession, signIn, signInUrl, signOut, signOutUrl } =
  SvelteKitAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
      GitHub({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
    ],
  });
```

## Register the auth handle

Wire the `handle` hook into `src/hooks.server.ts`:

```ts
// src/hooks.server.ts
export { handle } from '$lib/auth';
```

The handle intercepts requests under `/api/auth/*` and serves OAuth
endpoints; everything else passes through to your routes.

## Set the secret

The `secret` is used to sign + encrypt session JWTs. In production this MUST
be set:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set it as `AUTH_SECRET` in your environment.

## Next Steps

- [Customize session data](./session-data.md)
- [Override the default auth pages](./custom-pages.md)
- [Access the session server-side](./server-side/session-access.md)
