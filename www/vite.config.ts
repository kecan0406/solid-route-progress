import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import solid from '@solidjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { fileRoutes } from 'filesystem-routing/vite'
import { nitro } from 'nitro/vite'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'
import pkg from '../package.json' with { type: 'json' }
import { llms, siteOf } from './llms'
import { showcase } from './showcase.ts'
import { codeTheme, dropBackground } from './src/code-theme'

const src = (p: string) => new URL(`../src/${p}`, import.meta.url).pathname
const site = siteOf(pkg)

export default defineConfig({
  // `package.json` is the one place the site's version, origin and repository URL live.
  define: {
    __SP_VERSION__: JSON.stringify(pkg.version),
    __SP_REPO__: JSON.stringify(site.repo),
    __SP_SITE__: JSON.stringify(pkg.homepage),
  },
  plugins: [
    {
      // MDX emits JSX first; @solidjs/vite-plugin then compiles it like any .tsx.
      enforce: 'pre',
      ...mdx({
        jsx: true,
        jsxImportSource: '@solidjs/web',
        providerImportSource: '~/mdx',
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
    llms(site),
    showcase(),
    // Start mode: the entries are generated around `src/App.tsx`, in `src/Document.tsx`.
    // `extensions` also compiles the MDX pages and the `?pick=` route modules `fileRoutes` emits.
    solid({
      start: { middleware: './src/middleware.ts' },
      ssr: true,
      extensions: ['.mdx', '.tsx'],
    }),
    fileRoutes({ extensions: ['tsx', 'mdx'], types: true }),
    nitro(),
  ],
  // The site runs the package from source, so it always shows the code in this checkout.
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
      'solid-route-progress/router': src('router.tsx'),
      'solid-route-progress/navigation': src('navigation.tsx'),
      'solid-route-progress/style.css': src('style.css'),
      'solid-route-progress': src('index.ts'),
    },
  },
  server: { port: 5200, strictPort: true },
})
