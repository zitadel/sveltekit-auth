---
title: Caching
group: Advanced
children:
  - ./url-resolutions.md
  - ./deployment/self-hosted.md
  - ./deployment/vercel.md
  - ./deployment/netlify.md
---

# Caching content

Hosting providers often offer caching at the edge. Most sites see big
speed wins (and cost savings) by taking advantage of it — no cold
start, no request processing, no JavaScript parsing, just HTML served
straight from a CDN.

By default the user's session is read in a `load` function and rendered
into the HTML. That's fine for personalised pages, but it's a footgun
the moment those pages are cached: a cached response containing user
A's session will be served to user B.

To add caching in SvelteKit, use `setHeaders()` in a `load` function or
mark a route for prerendering. See the
[SvelteKit caching docs](https://kit.svelte.dev/docs/load#cookies-and-headers).

:::warning
If you cache a route, that route's load function MUST NOT call
`getSession()` or return session data. Otherwise the first user's
session leaks into the cached HTML served to everyone else.
:::

## Page specific cache rules

For a single cached route, call `setHeaders()` with `Cache-Control` and
avoid touching the session server-side. Read the session on the client
instead.

```ts
// src/routes/+page.server.ts
export const load = async ({ setHeaders }) => {
  setHeaders({
    'cache-control': 'public, max-age=86400, s-maxage=86400',
  });
  // Do not call getSession() here. Read session client-side via the
  // session store if you need it.
  return { posts: await getPosts() };
};
```

## Global cache rules

To cache most pages by default, set `Cache-Control` from the root
layout's `load` function and only override it on routes (like
`/profile`) that must stay dynamic.

```ts
// src/routes/+layout.server.ts
export const load = async ({ setHeaders }) => {
  setHeaders({
    'cache-control': 'public, max-age=86400, s-maxage=86400',
  });
  return {};
};
```

## Combining rules

`setHeaders()` calls in a leaf `load` override calls made higher up the
tree. So you can flip the default per route.

For example: cache every page except `/profile`.

```ts
// src/routes/+layout.server.ts — global default: cached
export const load = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, max-age=86400, s-maxage=86400' });
  return {};
};

// src/routes/profile/+page.server.ts — opt this route back into dynamic
import { getSession } from '$lib/auth';

export const load = async (event) => {
  event.setHeaders({ 'cache-control': 'private, no-store' });
  const session = await getSession(event);
  return { session };
};
```
