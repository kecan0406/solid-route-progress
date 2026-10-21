import { inject, vi } from 'vitest'
import { hydrate, type JSX } from '@solidjs/web'
import { update } from '../helpers'

/**
 * The client half: a page the server rendered (`global-setup.ts`), hydrated by code compiled for
 * the client. A bar that created a node on one side only would shift the hydration ids of
 * everything after it: the data the server serialized there would be loaded again, and its
 * elements created again instead of claimed.
 *
 * One page per test file, as one hydration per page load: once a document has hydrated, a later
 * `hydrate()` in it renders afresh.
 */

const pages = inject('pages')

/** Run the code of each `<script>` in `html` in the page's global scope, as parsing would. */
const runScripts = (html: string) => {
  for (const [, code] of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))
    // eslint-disable-next-line no-eval -- the server's own inline scripts, which a browser runs
    (0, eval)(code!)
}

/** Load page `name` as the server sent it, with the hydration script in its head, and hydrate it. */
export async function hydratePage(
  name: Exclude<keyof typeof pages, 'script'>,
  ui: () => JSX.Element,
) {
  runScripts(pages.script)
  const warnings: string[] = []
  for (const level of ['warn', 'error'] as const)
    vi.spyOn(console, level).mockImplementation((...args) => void warnings.push(args.join(' ')))
  const root = document.body.appendChild(document.createElement('div'))
  root.innerHTML = pages[name]
  runScripts(pages[name])
  const served = [...root.querySelectorAll('*')]
  hydrate(ui, root)
  // Long enough for a load the client made itself to land.
  await new Promise((resolve) => setTimeout(resolve))
  await update()
  return {
    root,
    warnings,
    /** The elements in the page now are exactly the ones the server sent. */
    claimed: () => {
      const now = [...root.querySelectorAll('*')]
      return now.length === served.length && now.every((element, i) => element === served[i])
    },
  }
}
