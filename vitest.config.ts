import { playwright } from '@vitest/browser-playwright'
import solid from 'vite-plugin-solid'
import { defineConfig, type ViteUserConfig } from 'vitest/config'

const src = (file: string) => new URL(`./src/${file}`, import.meta.url).pathname
const alias = {
  'solid-route-progress/router': src('router.tsx'),
  'solid-route-progress/navigation': src('navigation.tsx'),
  'solid-route-progress/style.css': src('style.css'),
  'solid-route-progress': src('index.ts'),
}

/** One project per runtime: the same source compiled for the DOM, for the server, and run in real browsers. */
const project = (
  name: string,
  test: ViteUserConfig['test'],
  solidOptions?: Parameters<typeof solid>[0],
): ViteUserConfig => ({
  plugins: [solid(solidOptions)],
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
