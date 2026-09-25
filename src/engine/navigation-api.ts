import { createHandoff, type Outcome, type ProgressController } from './progress'

/**
 * Minimal structural typings for the Navigation API (Baseline 2026-01), kept local so the
 * library type-checks against any `lib.dom` version.
 */
export interface NavigateEventLike extends Event {
  readonly navigationType: 'push' | 'replace' | 'reload' | 'traverse'
  readonly destination: { readonly url: string; readonly sameDocument: boolean }
  readonly canIntercept: boolean
  readonly userInitiated: boolean
  readonly hashChange: boolean
  readonly downloadRequest: string | null
  readonly formData: FormData | null
  /** The element that initiated the navigation, when known (Chrome 135, Firefox 147, Safari 26.2). */
  readonly sourceElement?: Element | null
}

export interface NavigationLike extends EventTarget {
  /** The intercepted navigation in flight, or `null`. Plain `pushState` / fragment navigations never set it. */
  readonly transition: object | null
}

/** `window.navigation`, or `undefined` where the Navigation API is unavailable. */
export const getNavigation = (): NavigationLike | undefined =>
  (globalThis as { navigation?: NavigationLike }).navigation

/** Anchors (or their ancestors) carrying this attribute never trigger the bar. */
export const IGNORE_ATTRIBUTE = 'data-sp-ignore'

/** Whether `target` is, or sits inside, an element marked `data-sp-ignore`. */
export const isIgnored = (target: EventTarget | null | undefined): boolean =>
  target instanceof Element && target.closest(`[${IGNORE_ATTRIBUTE}]`) !== null

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
 * Hold `controller` for each navigation the page starts, until `signal` aborts: every one that
 * leaves the document, and with `sameDocument` also those that stay in it, for pages whose
 * router does not report its own. One set of listeners serves both kinds. Does nothing without
 * the Navigation API.
 */
export function listenNavigation(
  controller: ProgressController,
  options: CrossDocumentOptions,
  signal: AbortSignal,
  sameDocument?: boolean,
): void {
  const navigation = getNavigation()
  if (!navigation) return
  // Leaving and staying navigations hold apart, so a `pushState` never ends a page load.
  const cross = createHandoff(controller)
  const same = createHandoff(controller)
  let timer: ReturnType<typeof setTimeout> | undefined
  const leave = (outcome?: Outcome) => {
    clearTimeout(timer)
    cross.end(outcome)
  }
  const settle = (outcome?: Outcome) => {
    leave(outcome)
    same.end(outcome)
  }
  const listen = <E extends Event>(
    target: EventTarget,
    type: string,
    listener: (event: E) => unknown,
  ) => target.addEventListener(type, listener as EventListener, { signal })

  listen<NavigateEventLike>(navigation, 'navigate', (event) => {
    const { url, sameDocument: staying } = event.destination
    if (
      event.defaultPrevented ||
      (staying
        ? !sameDocument || event.hashChange
        : // Downloads, and `mailto:`, `tel:` and friends, fire `navigate` too, yet never unload the document.
          event.downloadRequest !== null || !/^https?:/.test(url)) ||
      isIgnored(event.sourceElement) ||
      options.filter?.(event) === false
    )
      return
    if (staying) return same.next()
    cross.next()
    clearTimeout(timer)
    const timeout = options.timeout ?? 10_000
    if (timeout > 0) timer = setTimeout(leave, timeout)
  })
  // Intercepted, a navigation stays in this document (`sameDocument` is `false` until a router
  // intercepts it) and settles through `navigatesuccess` / `navigateerror`, so the safety net
  // stands down. Otherwise a same-document one was a plain `pushState`: it committed
  // synchronously, never set `transition`, and is over right here.
  listen(navigation, 'currententrychange', () =>
    navigation.transition ? clearTimeout(timer) : same.end(),
  )
  listen(navigation, 'navigatesuccess', () => settle())
  // A stop or a newer navigation aborts: nothing completed, so fade out instead of running to
  // 100%. Anything else is an intercept handler that failed.
  listen<ErrorEvent>(navigation, 'navigateerror', (event) =>
    settle(event.error?.name === 'AbortError' ? 'cancel' : 'error'),
  )
  // Back from the bfcache: the load being shown never happened here.
  listen<PageTransitionEvent>(window, 'pageshow', (event) => event.persisted && leave('cancel'))
  signal.addEventListener('abort', () => settle())
}
