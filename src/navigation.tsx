import { splitProps, type JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { OPTION_KEYS, Progress, useController, type ProgressProps } from './components'
import { DEV, warn } from './dev'
import { getNavigation, listenNavigation, type CrossDocumentOptions } from './engine/navigation-api'
import type { ProgressController } from './engine/progress'
import { disposalSignal } from './owner'

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
  if (DEV && !getNavigation())
    warn(
      'Navigation API unavailable: NavigationProgress shows nothing in this browser.',
      'navigation-api#where-the-api-is-missing',
    )
  listenNavigation(controller, options, disposalSignal(), true)
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
