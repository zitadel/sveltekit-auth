---
title: Session Access
group: Application Side
---

# Client-side session access

The auth handle hook populates `event.locals.session` on every request. To
make the session available client-side, return it from a root
`+layout.server.ts` load:

## Root layout load

```ts
// src/routes/+layout.server.ts
import { getSession } from '$lib/auth';

export async function load(event) {
  const session = await getSession(event);
  return { session };
}
```

## Use it in a +layout.svelte

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  export let data;
  $: session = data.session;
</script>

{#if session}
  <span>Hello, {session.user?.name}</span>
{:else}
  <a href="/auth/login">Sign in</a>
{/if}
<slot />
```

Child routes inherit `data.session` automatically via SvelteKit's layout
data forwarding.

## signIn / signOut

```ts
import { signIn, signOut } from '@zitadel/sveltekit-auth/client';

<button on:click={() => signIn('github')}>Sign in with GitHub</button>
<button on:click={() => signOut()}>Sign out</button>
```
