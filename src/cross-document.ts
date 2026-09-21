import { isServer } from 'solid-js/web'
import type { Outcome, ProgressController, Release } from './core'
import { disposalSignal, getNavigation, isIgnored, type NavigateEventLike } from './navigation-api'

export interface CrossDocumentOptions {
  /**
   * Safety net: a cross-document navigation that never unloads the page and is never
   * reported as canceled (a `204` response, a server-sent download) completes the bar after
   * this many milliseconds. `0` disables it.
   * @default 10000
   */
  timeout?: number
  /** Decide per navigation. Return `false` to keep the bar hidden. */
  filter?: (event: NavigateEventLike) => boolean
}

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
  const navigation = getNavigation()
  if (isServer || !navigation) return
  const signal = disposalSignal()
  let timer: ReturnType<typeof setTimeout> | undefined
  /** Releases the hold of the navigation still in flight. */
  let release: Release | undefined

  const finish = (outcome?: Outcome) => {
    clearTimeout(timer)
    release?.(outcome)
    release = undefined
  }

  navigation.addEventListener(
    'navigate',
    (event) => {
      if (
        event.defaultPrevented ||
        event.destination.sameDocument ||
        event.downloadRequest !== null ||
        // `mailto:`, `tel:` and friends fire `navigate` too, yet never unload the document.
        !/^https?:/.test(event.destination.url) ||
        isIgnored(event.sourceElement) ||
        options.filter?.(event) === false
      )
        return
      // Hold the new navigation before letting go of the one it replaces: no gap to complete in.
      const previous = release
      release = controller.start()
      previous?.()
      clearTimeout(timer)
      const timeout = options.timeout ?? 10_000
      if (timeout > 0) timer = setTimeout(finish, timeout)
    },
    { signal },
  )
  // A router intercepted it after all (`sameDocument` is `false` until someone does): it stays
  // in this document, so let `navigatesuccess` / `navigateerror` end it, not the safety net.
  navigation.addEventListener(
    'currententrychange',
    () => navigation.transition && clearTimeout(timer),
    {
      signal,
    },
  )
  navigation.addEventListener('navigatesuccess', () => finish(), { signal })
  // A stop or a newer navigation aborts: nothing completed, so fade out instead of running to
  // 100%. Anything else is an intercept handler that failed.
  navigation.addEventListener(
    'navigateerror',
    (event) => finish(event.error?.name === 'AbortError' ? 'cancel' : 'error'),
    { signal },
  )
  // Back from the bfcache: the load being shown never happened here.
  window.addEventListener('pageshow', (event) => event.persisted && finish('cancel'), { signal })
  signal.addEventListener('abort', () => finish())
}
