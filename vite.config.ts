import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/*.browser.test.{ts,tsx}'],
    browser: {
      enabled: false, // Set to true when running browser tests
      provider: 'playwright',
      headless: true,
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})