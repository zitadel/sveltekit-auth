<script lang="ts">
  import { signOut } from '@zitadel/sveltekit-auth/client';
</script>

<button
  type="button"
  onclick={() => signOut({ callbackUrl: '/' })}
  data-testid="signout-button"
  class="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-red-600"
>
  Sign out
</button>
