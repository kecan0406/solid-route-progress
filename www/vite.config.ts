import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import { solidStart } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'
import { codeTheme, dropBackground } from './src/code-theme'

const src = (p: string) => new URL(`../src/${p}`, import.meta.url).pathname

export default defineConfig({
  plugins: [
    {
      // MDX emits JSX first; vite-plugin-solid (inside solidStart) then compiles it like any .tsx.
      enforce: 'pre',
      ...mdx({
        jsx: true,
        jsxImportSource: 'solid-js',
        providerImportSource: 'solid-mdx',
        elementAttributeNameCase: 'html',
        stylePropertyNameCase: 'css',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeShiki, { theme: codeTheme, transformers: [dropBackground] }],
        ],
      }),
    },
    tailwindcss(),
    solidStart({ extensions: ['mdx'] }),
    nitro(),
  ],
  resolve: {
    alias: {
      'sprogress/router': src('router.tsx'),
      'sprogress/navigation': src('navigation.tsx'),
      'sprogress/style.css': src('style.css'),
      sprogress: src('index.ts'),
    },
  },
  // The SolidStart 2.0.4 dev toolbar imports trace-mapping, whose UMD `resolve-uri` has no ESM
  // default export unless Vite pre-bundles it.
  optimizeDeps: { include: ['@solidjs/start > @jridgewell/trace-mapping'] },
  server: { port: 5200, strictPort: true },
})
