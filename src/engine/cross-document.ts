import { getNavigation, isIgnored, type NavigateEventLike } from './navigation-api'
import { createHandoff, type Outcome, type ProgressController } from './progress'

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
 * The listeners behind `createCrossDocumentProgress()`: hold `controller` for each navigation
 * that leaves the document, until `signal` aborts. Does nothing without the Navigation API.
 */
export function listenCrossDocument(
  controller: ProgressController,
  options: CrossDocumentOptions,
  signal: AbortSignal,
): void {
  const navigation = getNavigation()
  if (!navigation) return
  let timer: ReturnType<typeof setTimeout> | undefined
  /** Holds the navigation still in flight. */
  const hold = createHandoff(controller)

  const finish = (outcome?: Outcome) => {
    clearTimeout(timer)
    hold.end(outcome)
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
      hold.next()
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
