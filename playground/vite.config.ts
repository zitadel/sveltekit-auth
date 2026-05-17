import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

// Load .env into process.env so server-side code using process.env works in dev
try { process.loadEnvFile?.('.env'); } catch { /* .env may not exist */ }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.PORT || '3000');

  return {
    plugins: [tailwindcss(), sveltekit()],
    server: {
      port,
    },
    preview: {
      port,
    },
  };
});
