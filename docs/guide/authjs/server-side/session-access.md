---
title: Session Access
group: OAuth Provider
category: Server Side
---

# Server-side session access

Access the current session from any server context (`+page.server.ts`,
`+server.ts`, hooks) using the factory-bound `getSession`:

## In a +page.server.ts load

```ts
// src/routes/profile/+page.server.ts
import { getSession } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export async function load(event) {
  const session = await getSession(event);
  if (!session) throw redirect(302, '/auth/login');
  return { user: session.user };
}
```

## In a +server.ts endpoint

```ts
// src/routes/api/me/+server.ts
import { getSession } from '$lib/auth';
import { json } from '@sveltejs/kit';

export async function GET(event) {
  const session = await getSession(event);
  if (!session) return json({ error: 'unauthorised' }, { status: 401 });
  return json({ user: session.user });
}
```

## Return shape

`getSession()` returns the `Session` object OAuth builds in the `session`
callback, or `null` when no valid session exists. It throws when OAuth
returns a non-200 (e.g. on signature/decode failure).
