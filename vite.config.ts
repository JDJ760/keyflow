import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Keyflow ships to GitHub Pages at https://<user>.github.io/keyflow/, so the
  // production build needs the '/keyflow/' base. The dev server stays at root.
  base: command === 'build' ? '/keyflow/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Modern browsers support <link rel="modulepreload"> natively. Skipping the
    // polyfill keeps the built HTML free of inline scripts, so our strict
    // Content-Security-Policy (script-src 'self') needs no 'unsafe-inline'.
    modulePreload: { polyfill: false },
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    restoreMocks: true,
  },
}))
