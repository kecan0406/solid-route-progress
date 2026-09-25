import type { CrossDocumentOptions } from './cross-document'
import { getNavigation, isIgnored } from './navigation-api'
import { createHandoff, type ProgressController } from './progress'

/**
 * The same-document half of `createNavigationProgress()`: hold `controller` for each
 * navigation that stays in the document, until `signal` aborts. Does nothing without the
 * Navigation API.
 */
export function listenSameDocument(
  controller: ProgressController,
  options: CrossDocumentOptions,
  signal: AbortSignal,
): void {
  const navigation = getNavigation()
  if (!navigation) return
  const hold = createHandoff(controller)

  navigation.addEventListener(
    'navigate',
    (event) => {
      if (
        event.defaultPrevented ||
        !event.destination.sameDocument ||
        event.hashChange ||
        isIgnored(event.sourceElement) ||
        options.filter?.(event) === false
      )
        return
      hold.next()
    },
    { signal },
  )
  // Only intercepted navigations settle through `navigatesuccess` / `navigateerror`. A plain
  // `pushState` commits synchronously, never sets `transition`, and is over right here.
  navigation.addEventListener('currententrychange', () => navigation.transition || hold.end(), {
    signal,
  })
  navigation.addEventListener('navigatesuccess', () => hold.end(), { signal })
  // An abort (a newer navigation, a stop) is not a failure; a rejected handler is.
  navigation.addEventListener(
    'navigateerror',
    (event) => hold.end(event.error?.name === 'AbortError' ? 'cancel' : 'error'),
    { signal },
  )
  signal.addEventListener('abort', () => hold.end())
}
