import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './frontend',
  publicDir: '../public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
  server: {
    port: 5173,
    allowedHosts: [
      'exceptions-thehun-silence-diy.trycloudflare.com',
      'localhost',
      '127.0.0.1',
      '.trycloudflare.com', // Permite cualquier Cloudflare Tunnel URL
    ],
  },
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
