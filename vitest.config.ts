import { playwright } from '@vitest/browser-playwright'
import solid from '@solidjs/vite-plugin'
import type { Plugin } from 'vite'
import { defineConfig, type ViteUserConfig } from 'vitest/config'

const src = (file: string) => new URL(`./src/${file}`, import.meta.url).pathname
const alias = {
  'solid-route-progress/router': src('router.tsx'),
  'solid-route-progress/navigation': src('navigation.tsx'),
  'solid-route-progress/style.css': src('style.css'),
  'solid-route-progress': src('index.ts'),
}

/**
 * One project per runtime: the same source compiled for the DOM, for the server, for hydrating
 * what the server rendered, for a production build, and run in real browsers.
 */
/** Resolve Solid's production builds, where `isDev` is `false`, wherever Vitest would pick its dev ones. */
const production: Plugin = {
  name: 'production-conditions',
  enforce: 'post',
  configEnvironment(_name, config) {
    const conditions = config.resolve?.conditions
    if (conditions)
      config.resolve!.conditions = conditions
        .map((condition) => (condition === 'development|production' ? 'production' : condition))
        .filter((condition) => condition !== 'development')
  },
}

const project = (
  name: string,
  test: ViteUserConfig['test'],
  solidOptions?: Parameters<typeof solid>[0],
  plugins: Plugin[] = [],
): ViteUserConfig => ({
  plugins: [solid(solidOptions), ...plugins],
  resolve: { alias },
  test: { name, ...test },
})

export default defineConfig({
  test: {
    projects: [
      project('dom', {
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        include: ['test/*.test.{ts,tsx}'],
      }),
      project('ssr', { environment: 'node', include: ['test/ssr/*.test.tsx'] }, { ssr: true }),
      project(
        'hydration',
        {
          environment: 'jsdom',
          setupFiles: ['./test/setup.ts'],
          include: ['test/hydration/*.test.tsx'],
          globalSetup: ['./test/hydration/global-setup.ts'],
        },
        // The plugin compiles non-hydratable client code under Vitest unless told otherwise.
        { solid: { hydratable: true } },
      ),
      project(
        'production',
        {
          environment: 'jsdom',
          setupFiles: ['./test/setup.ts'],
          include: ['test/production/*.test.tsx'],
        },
        { dev: false },
        [production],
      ),
      project('browser', {
        include: ['test/browser/*.test.tsx'],
        browser: {
          enabled: true,
          headless: true,
          screenshotFailures: false,
          provider: playwright(),
          instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
        },
      }),
    ],
  },
})
