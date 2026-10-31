import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const fromPackages = (name: string) => fileURLToPath(new URL(`../packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  plugins: [tailwindcss()],
  // Serve package sources directly so edits show up without rebuilding dist.
  resolve: {
    alias: {
      'gamified3d-stage': fromPackages('gamified3d-stage'),
      'gamified3d-interaction': fromPackages('gamified3d-interaction'),
    },
  },
});
