---
title: SvelteKitAuth Factory
group: OAuth Provider
---

# SvelteKitAuth Factory

The `SvelteKitAuth()` factory wires up the auth handler and returns
helpers bound to your config. Call it once in `src/lib/auth.ts`:

```ts
import { SvelteKitAuth } from '@zitadel/sveltekit-auth';

export const {
  handle,      // SvelteKit handle hook (intercepts /api/auth/*)
  getSession,  // server-side session reader
  signIn, signInUrl, signOut, signOutUrl,
} = SvelteKitAuth({
  secret: process.env.AUTH_SECRET,
  providers: [/* ... */],
});
```

## Return values

| Key | Type | Use |
|---|---|---|
| `handle` | `Handle` | Wire into `hooks.server.ts` |
| `getSession` | `(event: RequestEvent) => Promise<Session \| null>` | Read the session in load functions |
| `signIn`, `signInUrl`, `signOut`, `signOutUrl` | helpers | Compute or perform the redirect |

Note: SvelteKit returns `handle` (not `handlers`) because SvelteKit's
hook system uses a single handle per request, not separate GET/POST
handlers.

## Wiring the hook

```ts
// src/hooks.server.ts
export { handle } from '$lib/auth';
```

## Server-side reads

See [Server-side session access](./server-side/session-access.md).
