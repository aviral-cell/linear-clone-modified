import path from 'node:path';
import react from '@vitejs/plugin-react';
import { transformWithEsbuild } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.includes('/src/') || !id.endsWith('.js')) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
  ],
  test: {
    name: 'frontend',
    include: ['frontend/__tests__/**/*.{test,spec}.{js,jsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      path.resolve(__dirname, 'frontend/test/setup.ts'),
      path.resolve(__dirname, 'frontend/test/setup-dom.ts'),
    ],
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: false },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['frontend/src/**/*.{js,jsx}'],
      exclude: ['**/main.jsx'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend/src'),
      '\\.(css|less|scss|sass)$': path.resolve(__dirname, 'frontend/test/styleMock.ts'),
      '\\.(jpg|jpeg|png|gif|svg|webp)$': path.resolve(__dirname, 'frontend/test/fileMock.js'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
});
