import {
  createContext,
  createEffect,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Context,
  type JSX,
  type ParentProps,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import { createProgress, DEFAULTS, type ProgressController, type ProgressOptions } from './core'
import { DEV, warn } from './dev'

/** Context carrying the active controller. Exposed for integrations; prefer `useProgress()`. */
export const ProgressContext: Context<ProgressController | undefined> =
  createContext<ProgressController>()

/**
 * Read the nearest progress controller — from `<ProgressProvider>`, `<Progress>`,
 * `<RouteProgress>` or `<NavigationProgress>`.
 */
export function useProgress(): ProgressController {
  const controller = useContext(ProgressContext)
  if (!controller)
    throw new Error(
      'useProgress(): no progress controller in scope. Wrap the app in <ProgressProvider> (the route bar picks it up automatically) or call it inside <Progress>.',
    )
  return controller
}

/** The props that configure a controller, as opposed to the bar element. */
export const OPTION_KEYS: readonly (keyof ProgressOptions)[] = [
  'trickleTo',
  'delay',
  'stopDelay',
  'speed',
]

/**
 * The controller a bar drives: the `controller` prop, else the nearest `<ProgressProvider>`,
 * else a new one built from `options`. Options only apply in the last case, so development
 * builds say so when they would be dropped.
 */
export function useController(
  controller: ProgressController | undefined,
  options: ProgressOptions,
): ProgressController {
  const provided = controller ?? useContext(ProgressContext)
  if (!provided) return createProgress(options)
  if (DEV) {
    const dropped = OPTION_KEYS.filter((key) => options[key] !== undefined)
    if (dropped.length)
      warn(
        `${dropped.join(', ')} ignored: this bar drives an existing controller, so set options where it is created (createProgress() or <ProgressProvider>).`,
      )
  }
  return provided
}

export interface ProgressProviderProps extends ProgressOptions {
  /** Share an existing controller instead of creating one. */
  controller?: ProgressController
  children?: JSX.Element
}

/** Provides a controller to descendants without rendering anything. */
export function ProgressProvider(props: ProgressProviderProps): JSX.Element {
  const [local, options] = splitProps(props, ['controller', 'children'])
  // eslint-disable-next-line solid/reactivity -- the controller is picked once, at setup
  const controller = local.controller ?? createProgress(options)
  return <ProgressContext.Provider value={controller}>{local.children}</ProgressContext.Provider>
}

export interface ProgressProps
  extends ProgressOptions, Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style' | 'children' | 'role'> {
  /** Drive this bar from an existing controller (defaults to the nearest provided one, else a new one). */
  controller?: ProgressController
  /** Inline styles; merged with the custom properties the component sets. */
  style?: JSX.CSSProperties
  /** Accessible name announced for the progress bar. @default "Loading" */
  label?: string
  /**
   * Human-readable text for a known value, announced as `aria-valuetext` (as in Kobalte and
   * Radix), e.g. `(percent) => percent + ' percent uploaded'`. Not used while trickling.
   */
  getValueLabel?: (percent: number) => string
  /**
   * Set `data-sp-busy` on `<html>` while the bar is visible, for page-wide styling hooks
   * (e.g. Tailwind `in-data-sp-busy:opacity-50`). With several bars it stays set until the
   * last of them goes idle.
   * @default true
   */
  busyAttribute?: boolean
  /**
   * Also set `aria-busy="true"` on `<html>` while the bar is visible, as Turbo does. Off by
   * default: how screen readers treat a busy root varies.
   * @default false
   */
  ariaBusy?: boolean
  /** Custom template. Defaults to `<Bar />`. */
  children?: JSX.Element
}

const LOCAL = [
  'controller',
  'style',
  'label',
  'getValueLabel',
  'busyAttribute',
  'ariaBusy',
  'children',
  'class',
] as const

/** Bars currently marking the page busy, per attribute: it stays until the last one goes idle. */
const busyBars = new Map<string, Set<object>>()

function createBusyAttribute(attribute: string, value: string, active: () => boolean): void {
  let bars = busyBars.get(attribute)
  if (!bars) busyBars.set(attribute, (bars = new Set()))
  const bar = {}
  const sync = (on: boolean) => {
    if (on) bars.add(bar)
    else bars.delete(bar)
    if (bars.size) document.documentElement.setAttribute(attribute, value)
    else document.documentElement.removeAttribute(attribute)
  }
  createEffect(() => sync(active()))
  onCleanup(() => sync(false))
}

/**
 * The bar shell. Renders a fixed, full-width `role="progressbar"` element and mirrors the
 * controller into `--sp-value` / `--sp-speed` / `data-state` / `data-error`; everything
 * visual lives in `style.css`. Renders the idle shell on the server.
 */
export function Progress(props: ProgressProps): JSX.Element {
  const [local, options, rest] = splitProps(props, LOCAL, OPTION_KEYS)
  // eslint-disable-next-line solid/reactivity -- the controller is picked once, at setup
  const controller = useController(local.controller, options)
  let root!: HTMLDivElement

  // While trickling the target is a guess, so the bar reports as indeterminate.
  const valueNow = () =>
    controller.state() === 'trickle' ? undefined : Math.round(controller.value() * 100)
  const valueText = () => {
    const percent = valueNow()
    return percent === undefined ? undefined : local.getValueLabel?.(percent)
  }

  if (!isServer) {
    if (DEV)
      onMount(() => {
        // No client rects means nothing is laid out (display: none, or a DOM without layout such as jsdom).
        if (root.getClientRects().length && getComputedStyle(root).position === 'static')
          warn("style.css is not loaded: import 'solid-route-progress/style.css' once.")
      })
    createBusyAttribute(
      'data-sp-busy',
      '',
      () => local.busyAttribute !== false && controller.active(),
    )
    createBusyAttribute('aria-busy', 'true', () => local.ariaBusy === true && controller.active())
  }

  return (
    <ProgressContext.Provider value={controller}>
      <div
        // Spread first: the attributes below mirror the controller and must win.
        {...rest}
        ref={root}
        role="progressbar"
        aria-label={local.label ?? 'Loading'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow()}
        aria-valuetext={valueText()}
        data-state={controller.state()}
        data-error={controller.error() ? '' : undefined}
        class={local.class ? `sprogress ${local.class}` : 'sprogress'}
        style={{
          ...local.style,
          '--sp-value': controller.value(),
          // Always written, so the CSS transitions run on the same clock as the JS timers.
          '--sp-speed': `${controller.options.speed ?? DEFAULTS.speed}ms`,
        }}
      >
        {local.children ?? <Bar />}
      </div>
    </ProgressContext.Provider>
  )
}

/** The sliding bar: a full-width strip slid in from the inline-start edge. */
export function Bar(props: ParentProps<JSX.HTMLAttributes<HTMLDivElement>>): JSX.Element {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={local.class ? `sprogress-bar ${local.class}` : 'sprogress-bar'} {...rest} />
}
