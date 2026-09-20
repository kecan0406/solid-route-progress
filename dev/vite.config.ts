import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

const src = (p: string) => new URL(`../src/${p}`, import.meta.url).pathname

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      'sprogress/router': src('router.tsx'),
      'sprogress/navigation': src('navigation.tsx'),
      'sprogress/style.css': src('style.css'),
      sprogress: src('index.ts'),
    },
  },
  server: { port: 5199, strictPort: true },
})
