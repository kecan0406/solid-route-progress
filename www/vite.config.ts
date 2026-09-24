import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import { solidStart } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'
import pkg from '../package.json' with { type: 'json' }
import { llms, siteOf } from './llms'
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
    llms(site),
    solidStart({ extensions: ['mdx'], middleware: 'src/middleware.ts' }),
    nitro(),
  ],
  resolve: {
    alias: {
      'solid-route-progress/router': src('router.tsx'),
      'solid-route-progress/navigation': src('navigation.tsx'),
      'solid-route-progress/style.css': src('style.css'),
      'solid-route-progress': src('index.ts'),
    },
  },
  // The SolidStart 2.0.4 dev toolbar imports trace-mapping, whose UMD `resolve-uri` has no ESM
  // default export unless Vite pre-bundles it.
  optimizeDeps: { include: ['@solidjs/start > @jridgewell/trace-mapping'] },
  server: { port: 5200, strictPort: true },
})
