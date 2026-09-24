// Minified throwaway builds used only by `scripts/size.mjs` to measure realistic gzip sizes.
import { defineConfig, type UserConfig } from 'tsdown'
import solid from 'unplugin-solid/rolldown'

const production: UserConfig = {
  platform: 'browser',
  target: 'es2022',
  format: 'esm',
  minify: true,
  dts: false,
  publint: false,
  attw: false,
  plugins: [
    solid({ solid: { generate: 'dom', hydratable: true } }),
    // What a production build sees: solid-js/web's `isDev` is `false`, so the diagnostics fold away.
    {
      name: 'production-dev',
      resolveId: (id) => (id === './dev' ? '\0dev' : null),
      load: (id) =>
        id === '\0dev'
          ? 'export const DEV = false; export const warn = () => {}; export const explain = () => ""'
          : null,
    },
  ],
}

export default defineConfig([
  // The published entries, chunked the way they ship.
  {
    ...production,
    entry: { index: 'src/index.ts', router: 'src/router.tsx', navigation: 'src/navigation.tsx' },
    outDir: '.size',
    outputOptions: { chunkFileNames: 'shared.js' },
  },
  // One import at a time, tree-shaken on its own: catches the core dragging in the components.
  {
    ...production,
    entry: { 'createProgress-only': 'scripts/size-entries/create-progress.ts' },
    outDir: '.size-exports',
  },
])
