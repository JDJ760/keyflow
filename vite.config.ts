import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The dev server needs ws:/wss: in connect-src for Vite HMR; production does
// not. Strip them from the CSP meta at build time so the shipped policy is
// strictly same-origin.
function tightenCsp(): Plugin {
  return {
    name: 'keyflow:tighten-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace("connect-src 'self' ws: wss:", "connect-src 'self'")
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Keyflow ships to GitHub Pages at https://<user>.github.io/keyflow/, so the
  // production build needs the '/keyflow/' base. The dev server stays at root.
  base: command === 'build' ? '/keyflow/' : '/',
  plugins: [react(), tailwindcss(), tightenCsp()],
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
