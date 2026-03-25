/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  server: {
    proxy: {
      // US-01: sin API gateway, reenvía al servicio público Django (runserver 8003).
      "/api/public": {
        target: "http://127.0.0.1:8003",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/public/, ""),
      },
      // Mismo Django que /api/public (puerto 8003): ruta interna /chatbot/request/
      "/api/chatbot": {
        target: "http://127.0.0.1:8003",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chatbot/, "/chatbot"),
      },
    },
  },
})
