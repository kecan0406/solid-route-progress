import { defineConfig, type UserConfig } from 'tsdown'
import solid from 'unplugin-solid/rolldown'

const entry = {
  index: 'src/index.ts',
  router: 'src/router.tsx',
  navigation: 'src/navigation.tsx',
}

const shared: UserConfig = {
  entry,
  platform: 'browser',
  target: 'es2022',
  format: 'esm',
  treeshake: true,
}

export default defineConfig([
  // Compiled for the DOM: what non-Solid-aware bundlers resolve through `default`.
  {
    ...shared,
    tsconfig: 'tsconfig.build.json',
    dts: true,
    plugins: [solid({ solid: { generate: 'dom', hydratable: true } })],
    outputOptions: { chunkFileNames: 'shared.js' },
    copy: [{ from: 'src/style.css', to: 'dist' }],
    publint: true,
    attw: { profile: 'esm-only', excludeEntrypoints: [/\.css$/, /package\.json$/] },
  },
  // JSX preserved: what SolidStart / vite-plugin-solid resolve through the `solid` condition,
  // so the consumer compiles for DOM or SSR as appropriate.
  {
    ...shared,
    clean: false,
    dts: false,
    tsconfig: false,
    inputOptions: { tsconfig: false, transform: { jsx: 'preserve' } },
    outputOptions: { chunkFileNames: 'shared.jsx' },
    outExtensions: () => ({ js: '.jsx' }),
  },
])
