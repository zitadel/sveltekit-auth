---
title: Protecting Pages
group: Application Side
---

# Protecting pages

SvelteKit's idiomatic protection is via a `+layout.server.ts` or
`+page.server.ts` load that throws a redirect when the session is absent.
You can also gate everything from `hooks.server.ts`.

## Layout-level gate

```ts
// src/routes/(protected)/+layout.server.ts
import { getSession } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export async function load(event) {
  const session = await getSession(event);
  if (!session) {
    throw redirect(302, `/auth/login?callbackUrl=${encodeURIComponent(event.url.pathname)}`);
  }
  return { session };
}
```

Any route under `(protected)/` inherits the gate.

## Hook-level gate (catch-all)

For globally protecting an app prefix:

```ts
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { handle as authHandle } from '$lib/auth';

async function protectRoutes({ event, resolve }) {
  if (event.url.pathname.startsWith('/profile')) {
    const session = await event.locals.auth?.();
    if (!session) throw redirect(302, '/auth/login');
  }
  return resolve(event);
}

export const handle = sequence(authHandle, protectRoutes);
```
