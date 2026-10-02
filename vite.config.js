import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/relief-hub/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        portfolio: resolve(rootDir, 'portfolio/index.html'),
        portfolioAdmin: resolve(rootDir, 'portfolio/admin/index.html'),
      },
    },
  },
});
