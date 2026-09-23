import { splitProps, type JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { OPTION_KEYS, Progress, useController, type ProgressProps } from './components'
import { createHandoff, type ProgressController } from './core'
import { createCrossDocumentProgress, type CrossDocumentOptions } from './cross-document'
import { DEV, warn } from './dev'
import { disposalSignal, getNavigation, isIgnored } from './navigation-api'

export type NavigationProgressOptions = CrossDocumentOptions

/**
 * Router-agnostic integration built on the browser Navigation API: the bar starts on
 * `navigate` and completes once the navigation settles, so any same-document router that
 * intercepts navigations — or none at all — is covered. Cross-document navigations show
 * the bar until the page unloads. Hash changes, `download` links and `data-sp-ignore`
 * links are skipped. Where the API is unavailable this does nothing.
 */
export function createNavigationProgress(
  controller: ProgressController,
  options: NavigationProgressOptions = {},
): void {
  if (isServer) return
  const navigation = getNavigation()
  if (!navigation) {
    if (DEV) warn('Navigation API unavailable: NavigationProgress shows nothing in this browser.')
    return
  }
  createCrossDocumentProgress(controller, options)
  const signal = disposalSignal()
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

export interface NavigationProgressProps extends ProgressProps, NavigationProgressOptions {}

const LOCAL = ['filter', 'timeout', 'controller'] as const

/** `<Progress>` driven by the Navigation API. No router required. Picks up a surrounding `<ProgressProvider>`. */
export function NavigationProgress(props: NavigationProgressProps): JSX.Element {
  const [local, options, rest] = splitProps(props, LOCAL, OPTION_KEYS)
  // eslint-disable-next-line solid/reactivity -- the controller is picked once, at setup
  const controller = useController(local.controller, options)
  createNavigationProgress(controller, local)
  return <Progress controller={controller} {...rest} />
}
