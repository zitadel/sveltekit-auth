---
title: Installation
group: Getting Started
---

# Installation

Install `@zitadel/sveltekit-auth` and `@auth/core`:

```bash
# npm
npm install @zitadel/sveltekit-auth @auth/core

# pnpm
pnpm add @zitadel/sveltekit-auth @auth/core

# yarn
yarn add @zitadel/sveltekit-auth @auth/core
```

Register the auth handle in `src/hooks.server.ts`:

```ts
// src/hooks.server.ts
export { handle } from '$lib/auth';
```
