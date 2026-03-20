import path from 'node:path';
import react from '@vitejs/plugin-react';
import { transformWithEsbuild } from 'vite';
import { defineConfig } from 'vitest/config';

const frontendRoot = path.resolve(__dirname, 'frontend');
const frontendTestRoot = path.resolve(frontendRoot, 'test');

export default defineConfig({
  root: frontendRoot,
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
    dir: frontendRoot,
    include: ['__tests__/**/*.{test,spec}.{js,jsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '../backend/**',
      '../candidate-contracts/**',
      '../problem-statements/**',
      '../technical-specs/**',
      '../scripts/**',
    ],
    environment: 'happy-dom',
    globals: true,
    setupFiles: [
      path.resolve(frontendTestRoot, 'setup.ts'),
      path.resolve(frontendTestRoot, 'setup-dom.ts'),
    ],
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
    fileParallelism: false,
    pool: 'threads',
    poolOptions: {
      threads: { singleThread: true },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['**/main.jsx'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(frontendRoot, 'src'),
      '\\.(css|less|scss|sass)$': path.resolve(frontendTestRoot, 'styleMock.ts'),
      '\\.(jpg|jpeg|png|gif|svg|webp)$': path.resolve(frontendTestRoot, 'fileMock.js'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
});
