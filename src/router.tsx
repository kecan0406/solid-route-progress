import { createEffect, on, onCleanup, splitProps, type JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useBeforeLeave, useIsRouting, type Location } from '@solidjs/router'
import { OPTION_KEYS, Progress, useController, type ProgressProps } from './components'
import { createHandoff, type ProgressController } from './core'
import { createCrossDocumentProgress, type CrossDocumentOptions } from './cross-document'
import { DEV, explain } from './dev'
import { disposalSignal, isIgnored } from './navigation-api'

export interface RouteProgressOptions {
  /**
   * Skip the bar when a navigation keeps the same `pathname` and only changes the search
   * string or hash.
   * @default false
   */
  shallow?: boolean
  /**
   * Decide per navigation. Return `false` to keep the bar hidden. `to` is the resolved
   * path (`pathname + search + hash`); `from` is the current location.
   */
  filter?: (to: string, from: Location) => boolean
  /**
   * Also show the bar for navigations the page starts that leave the document: external
   * links, plain form posts, `location.reload()`. Needs the Navigation API; browser-UI
   * navigations (reload button, address bar) never reach the page. Pass an object to tune
   * the safety timeout or filter by event.
   * @default true
   */
  crossDocument?: boolean | CrossDocumentOptions
}

/**
 * Wire a controller to `@solidjs/router`: `useIsRouting()` covers `<A>` clicks,
 * `navigate()`, back/forward and action redirects, including any `<Suspense>` the new
 * route waits on. `useBeforeLeave()` supplies the target for `shallow` / `filter`.
 */
export function createRouteProgress(
  controller: ProgressController,
  options: RouteProgressOptions = {},
): void {
  if (isServer) return
  const isRouting = DEV ? explainedIsRouting() : useIsRouting()
  let skip = false
  const skipNext = () => {
    skip = true
    // The matching `isRouting` flip happens synchronously, so a flag still set on the next
    // microtask belongs to a navigation the router dropped (or a click that made none).
    queueMicrotask(() => {
      skip = false
    })
  }

  // `<A data-sp-ignore>`: capture phase, so this runs before the router's own click handler.
  document.addEventListener(
    'click',
    (event) => {
      if (isIgnored(event.target)) skipNext()
    },
    { capture: true, signal: disposalSignal() },
  )

  useBeforeLeave((event) => {
    if (typeof event.to !== 'string') return
    if (
      (options.shallow === true && samePathname(event.to, event.from.pathname)) ||
      options.filter?.(event.to, event.from) === false
    )
      skipNext()
  })

  // One hold per navigation, so other holders (`track()`, cross-document) keep theirs.
  const hold = createHandoff(controller)
  // `on()` keeps the controller's own signals out of this effect's dependencies.
  createEffect(
    on(isRouting, (routing) => {
      if (routing && !skip) hold.next()
      else hold.end()
      if (routing) skip = false
    }),
  )
  onCleanup(() => hold.end())

  if (options.crossDocument !== false)
    createCrossDocumentProgress(
      controller,
      typeof options.crossDocument === 'object' ? options.crossDocument : undefined,
    )
}

/** The router's own error names neither this component nor the fix, and both usually go wrong together. */
function explainedIsRouting() {
  try {
    return useIsRouting()
  } catch (cause) {
    throw new Error(
      explain(
        '<RouteProgress> must render under <Router>: put it in the root layout, or use <NavigationProgress> from solid-route-progress/navigation without a router.',
        'quick-start',
      ),
      { cause },
    )
  }
}

const samePathname = (to: string, pathname: string) => {
  const end = to.search(/[?#]/)
  const target = end === -1 ? to : to.slice(0, end)
  return target.replace(/\/+$/, '') === pathname.replace(/\/+$/, '')
}

export interface RouteProgressProps extends ProgressProps, RouteProgressOptions {}

const LOCAL = ['shallow', 'filter', 'crossDocument', 'controller'] as const

/**
 * Drop-in route progress bar. Place it anywhere under `<Router>` — typically in the root
 * layout — and import `style.css` once. Inside a `<ProgressProvider>` it drives that
 * provider's controller, so `useProgress()` works anywhere in the app.
 *
 * @example
 * ```tsx
 * <Router root={(props) => <><RouteProgress /><Suspense>{props.children}</Suspense></>}>
 * ```
 */
export function RouteProgress(props: RouteProgressProps): JSX.Element {
  const [local, options, rest] = splitProps(props, LOCAL, OPTION_KEYS)
  // eslint-disable-next-line solid/reactivity -- the controller is picked once, at setup
  const controller = useController(local.controller, options)
  createRouteProgress(controller, local)
  return <Progress controller={controller} {...rest} />
}
