import solid from '@solidjs/vite-plugin'
import { createServer } from 'vite'
import type { TestProject } from 'vitest/node'
import type { Pages } from './render'

/**
 * Render the pages on the server before the client tests run, compiled for SSR by the same
 * plugin the server build of an app uses, and hand the HTML to them.
 */
export default async function setup(project: TestProject): Promise<void> {
  const vite = await createServer({
    configFile: false,
    root: new URL('../..', import.meta.url).pathname,
    plugins: [solid({ ssr: true })],
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const { render } = (await vite.ssrLoadModule('/test/hydration/render.tsx')) as {
      render: () => Promise<Pages>
    }
    project.provide('pages', await render())
  } finally {
    await vite.close()
  }
}

declare module 'vitest' {
  export interface ProvidedContext {
    pages: Pages
  }
}
