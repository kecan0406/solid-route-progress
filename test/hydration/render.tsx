import { generateHydrationScript, renderToStream } from '@solidjs/web'
import { createProgress } from '../../src'
import { BarThenData, DataAlone, RouterThenData } from './app'

/** The server half: each page rendered to HTML once its data has settled, as a stream ends. */
export async function render(): Promise<Pages> {
  return {
    script: generateHydrationScript(),
    alone: await renderToStream(() => <DataAlone />),
    bar: await renderToStream(() => <BarThenData controller={createProgress()} />),
    router: await renderToStream(() => <RouterThenData controller={createProgress()} />),
  }
}

export interface Pages {
  /** What a page's `<head>` carries for hydration. */
  script: string
  alone: string
  bar: string
  router: string
}
