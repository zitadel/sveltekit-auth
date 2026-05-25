---
title: Custom Pages
group: OAuth Provider
---

# Custom auth pages

Point `pages.signIn` and `pages.error` at your custom routes:

## Config

```ts
// src/lib/auth.ts
SvelteKitAuth({
  pages: { signIn: '/auth/login', error: '/auth/error' },
})
```

## Custom sign-in page

```svelte
<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  let csrfToken = '';
  onMount(async () => {
    const r = await fetch('/api/auth/csrf');
    csrfToken = (await r.json()).csrfToken;
  });
</script>

<form action="/api/auth/signin/github" method="post">
  <input type="hidden" name="csrfToken" value={csrfToken} />
  <button type="submit">Sign in with GitHub</button>
</form>
```

## Custom error page

```svelte
<!-- src/routes/auth/error/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  $: error = $page.url.searchParams.get('error') ?? 'default';
</script>

<h1>Sign-in error</h1>
<p>Code: {error}</p>
```
