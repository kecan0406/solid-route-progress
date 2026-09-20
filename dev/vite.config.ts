import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

const src = (p: string) => new URL(`../src/${p}`, import.meta.url).pathname

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      'solid-route-progress/router': src('router.tsx'),
      'solid-route-progress/navigation': src('navigation.tsx'),
      'solid-route-progress/style.css': src('style.css'),
      'solid-route-progress': src('index.ts'),
    },
  },
  server: { port: 5199, strictPort: true },
})
