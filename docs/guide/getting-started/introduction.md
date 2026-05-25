---
title: Introduction
group: Getting Started
children:
  - ./installation.md
---

# Introduction

`@zitadel/sveltekit-auth` is an open source library that provides
authentication for SvelteKit applications. It wraps
auth (`@auth/core`) to bring OAuth, credentials, and
magic-link authentication to SvelteKit with a native developer experience.

Through a direct integration into SvelteKit hooks, you can access and utilize
user sessions within your load functions, server endpoints, and pages
directly.

## Features

### Authentication providers

- OAuth (eg. GitHub, Google, Twitter, Azure...)
- Custom OAuth (Add your own!)
- Credentials (username / email + password)
- Email Magic URLs

### Application Side Session Management

- Session fetching from `event.locals` (populated by the auth handle hook)
- Methods to `getSession`, `signIn` and `signOut`
- Full TypeScript support for all methods and properties

### Application protection

- Hook-based session population in `hooks.server.ts`
- Load-function protection via `event.locals.auth()`
- Server-side session access in any `+page.server.ts` / `+server.ts`
