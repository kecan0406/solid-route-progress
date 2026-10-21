import { createEffect, createMemo, latest, omit, untrack } from 'solid-js'
import { isServer, type JSX } from '@solidjs/web'
import { useInRouter, useIsRouting, useLocation, type Location } from '@solidjs/router'
import { CLIENT_ONLY, OPTION_KEYS, Progress, useController, type ProgressProps } from './components'
import { DEV, explain } from './dev'
import { isIgnored, listenNavigation, type CrossDocumentOptions } from './engine/navigation-api'
import { createHandoff, type ProgressController } from './engine/progress'
import { disposalSignal } from './owner'

export interface RouteProgressOptions {
  /**
   * Skip the bar when a navigation keeps the same `pathname` and only changes the search
   * string or hash.
   * @default false
   */
  shallow?: boolean
  /**
   * Decide per navigation, back/forward included. Return `false` to keep the bar hidden. `to`
   * is where the navigation goes (`pathname + search + hash`); `from` is the current location.
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
 * Wire a controller to `@solidjs/router`: `useIsRouting()` covers link clicks, `navigate()`,
 * back/forward and form-action redirects, including any `<Loading>` the new route waits on.
 * The location's in-flight value supplies the target for `shallow` / `filter`.
 */
export function createRouteProgress(
  controller: ProgressController,
  options: RouteProgressOptions = {},
): void {
  if (isServer) return
  // The router's own error names neither this component nor the fix, and both usually go wrong together.
  if (DEV && !useInRouter())
    throw new Error(
      explain(
        '<RouteProgress> must render under <Router>: put it in the root layout, or use <NavigationProgress> from solid-route-progress/navigation without a router.',
        'quick-start',
      ),
    )
  const isRouting = useIsRouting()
  const location = useLocation()
  const signal = disposalSignal()

  // `<a data-sp-ignore>`: capture phase, so this runs before the router's own click handler. The
  // navigation the click starts is in flight before the task ends, so the mark lasts until then.
  let ignoring = false
  document.addEventListener(
    'click',
    (event) => {
      if (!isIgnored(event.target)) return
      ignoring = true
      setTimeout(() => (ignoring = false))
    },
    { capture: true, signal },
  )

  /** Where the navigation in flight goes, while there is one. */
  const target = createMemo(
    () =>
      isRouting() ? latest(() => location.pathname + location.search + location.hash) : undefined,
    CLIENT_ONLY,
  )
  // One hold per navigation, so other holders (`track()`, cross-document) keep theirs.
  const hold = createHandoff(controller)
  createEffect(
    target,
    (to) => {
      if (to !== undefined && !ignoring && untrack(() => shows(to, location, options))) hold.next()
      else hold.end()
    },
    CLIENT_ONLY,
  )
  signal.addEventListener('abort', () => hold.end())

  const crossDocument = untrack(() => options.crossDocument)
  if (crossDocument !== false)
    listenNavigation(controller, typeof crossDocument === 'object' ? crossDocument : {}, signal)
}

/** Whether a navigation to `to` shows the bar. `from` is the location it leaves. */
const shows = (to: string, from: Location, options: RouteProgressOptions) =>
  !(options.shallow === true && samePathname(to, from.pathname)) &&
  options.filter?.(to, from) !== false

/** The pathname alone: no trailing slashes, no search string, no hash. */
const bare = (path: string) => path.replace(/\/*([?#].*)?$/, '')

const samePathname = (to: string, pathname: string) => bare(to) === bare(pathname)

export interface RouteProgressProps extends ProgressProps, RouteProgressOptions {}

const LOCAL = ['shallow', 'filter', 'crossDocument', 'controller'] as const

/**
 * Drop-in route progress bar. Place it anywhere under `<Router>` — typically in the root
 * layout — and import `style.css` once. Inside a `<ProgressProvider>` it drives that
 * provider's controller, so `useProgress()` works anywhere in the app.
 *
 * @example
 * ```tsx
 * <Router>{(props) => <><RouteProgress /><Loading>{props.children}</Loading></>}</Router>
 * ```
 */
export function RouteProgress(props: RouteProgressProps): JSX.Element {
  const controller = useController(props)
  createRouteProgress(controller, props)
  const rest = omit(props, ...LOCAL, ...OPTION_KEYS)
  return <Progress controller={controller} {...rest} />
}
