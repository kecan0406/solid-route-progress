import { isServer } from 'solid-js/web'
import { listenNavigation, type CrossDocumentOptions } from './engine/navigation-api'
import type { ProgressController } from './engine/progress'
import { disposalSignal } from './owner'

/**
 * Show the bar for navigations the page starts that leave the current document: external
 * links, plain form posts, `location` assignments and reloads, back/forward to another
 * document. Browser-UI navigations (the reload button, the address bar, bookmarks) never
 * reach the page, so they show nothing.
 *
 * Uses the Navigation API `navigate` event, which fires before the request is made; where
 * the API is missing this does nothing. Links marked `data-sp-ignore` are skipped. The bar
 * fades out when the navigation is canceled before the document unloads (`navigateerror`:
 * a stop, a newer navigation) or the page is restored from the back/forward cache, and
 * completes after `timeout`, the only end for a `204` or a server-sent download, which
 * Chromium does not report back. A navigation a router intercepts instead completes on
 * `navigatesuccess` / `navigateerror`.
 */
export function createCrossDocumentProgress(
  controller: ProgressController,
  options: CrossDocumentOptions = {},
): void {
  if (!isServer) listenNavigation(controller, options, disposalSignal())
}
