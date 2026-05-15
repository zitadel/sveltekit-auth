import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts',
    adapter: 'src/adapter.ts',
  },
  format: ['esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
