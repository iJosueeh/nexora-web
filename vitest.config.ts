import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: [
      '**/.forge/**',
      '**/.opencode/**',
      '**/node_modules/**',
    ],
    alias: {
      '@app': path.resolve(__dirname, './src/app')
    },
  },
});
