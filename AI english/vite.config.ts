import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/llm-proxy': {
        target: 'http://127.0.0.1:3001',
        rewrite: path => '/proxy',
      },
    },
  },
})
