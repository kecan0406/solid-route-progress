import {
  createContext,
  createEffect,
  createMemo,
  omit,
  onSettled,
  untrack,
  useContext,
  type Context,
  type ParentProps,
} from 'solid-js'
import { isServer, type JSX } from '@solidjs/web'
import { createProgress } from './core'
import { DEV, warn } from './dev'
import { DEFAULTS, type ProgressController, type ProgressOptions } from './engine/progress'

/**
 * Context carrying the active controller, `null` outside any. Exposed for integrations; prefer
 * `useProgress()`.
 */
export const ProgressContext: Context<ProgressController | null> =
  createContext<ProgressController | null>(null)

/**
 * Read the nearest progress controller — from `<ProgressProvider>`, `<Progress>`,
 * `<RouteProgress>` or `<NavigationProgress>`.
 */
export function useProgress(): ProgressController {
  const controller = useContext(ProgressContext)
  if (!controller)
    throw new Error(
      DEV
        ? 'useProgress(): no progress controller in scope. Wrap the app in <ProgressProvider> (the route bar picks it up automatically) or call it inside <Progress>.'
        : 'useProgress(): no progress controller in scope.',
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

/** The option props alone, read when the controller needs them, so reactive props work. */
const optionsOf = (props: ProgressOptions): ProgressOptions =>
  omit(props, (key) => !OPTION_KEYS.includes(key as keyof ProgressOptions))

/**
 * The controller a bar drives, picked once at setup: the `controller` prop, else the nearest
 * `<ProgressProvider>`, else a new one built from the option props. Options only apply in the
 * last case, so development builds say so when they would be dropped.
 */
export function useController(
  props: ProgressOptions & { controller?: ProgressController | undefined },
): ProgressController {
  const provided = untrack(() => props.controller) ?? useContext(ProgressContext)
  if (!provided) return createProgress(optionsOf(props))
  if (DEV) {
    const dropped = untrack(() => OPTION_KEYS.filter((key) => props[key] !== undefined))
    if (dropped.length)
      warn(
        `${dropped.join(', ')} ignored: this bar drives an existing controller, so set options where it is created (createProgress() or <ProgressProvider>).`,
        'components#progressprovider',
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
  // Picked once, at setup.
  const controller = untrack(() => props.controller) ?? createProgress(optionsOf(props))
  return <ProgressContext value={controller}>{props.children}</ProgressContext>
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

/**
 * For a memo or effect the server never creates: it takes no hydration id, so the ids of the
 * nodes after it still match the server's.
 */
export const CLIENT_ONLY = { transparent: true } as const

/** How many bars mark the page busy, per attribute: it stays until the last one goes idle. */
const busy: Record<string, number> = {}

/**
 * Mirror `active` onto `<html>` as `attribute`. Only a real change is written, and only by the
 * first bar to show or the last to hide, so moves within a load never touch `<html>` (no
 * mutation records, no style invalidation for rules keyed on the attribute).
 */
function createBusyAttribute(attribute: string, value: string, active: () => boolean): void {
  const count = (by: number) => (busy[attribute] = (busy[attribute] ?? 0) + by)
  // The memo drops repeats, so the effect runs only when the bar shows or hides.
  createEffect(
    createMemo(active, CLIENT_ONLY),
    (on) => {
      if (!on) return
      const html = document.documentElement
      if (count(1) === 1) html.setAttribute(attribute, value)
      // Runs once the bar hides, or when it is disposed while visible.
      return () => {
        if (!count(-1)) html.removeAttribute(attribute)
      }
    },
    CLIENT_ONLY,
  )
}

/** Development only: say so once the bar mounts laid out but unstyled. */
const checkStylesheet = (root: HTMLElement) =>
  onSettled(() => {
    // No client rects means nothing is laid out (display: none, or a DOM without layout such as jsdom).
    if (root.getClientRects().length && getComputedStyle(root).position === 'static')
      warn(
        "style.css is not loaded: import 'solid-route-progress/style.css' once.",
        'installation#stylesheet',
      )
  })

/**
 * The bar shell. Renders a fixed, full-width `role="progressbar"` element and mirrors the
 * controller into `--sp-value` / `--sp-speed` / `data-state` / `data-error`; everything
 * visual lives in `style.css`. Renders the idle shell on the server.
 */
export function Progress(props: ProgressProps): JSX.Element {
  const controller = useController(props)
  const rest = omit(props, ...LOCAL, ...OPTION_KEYS)

  // While trickling the target is a guess, so the bar reports as indeterminate.
  const valueNow = () =>
    controller.state() === 'trickle' ? undefined : Math.round(controller.value() * 100)
  const valueText = () => {
    const percent = valueNow()
    return percent === undefined ? undefined : props.getValueLabel?.(percent)
  }

  if (!isServer) {
    createBusyAttribute(
      'data-sp-busy',
      '',
      () => props.busyAttribute !== false && controller.active(),
    )
    createBusyAttribute('aria-busy', 'true', () => props.ariaBusy === true && controller.active())
  }

  return (
    <ProgressContext value={controller}>
      <div
        // Spread first: the attributes below mirror the controller and must win.
        {...rest}
        // `undefined` in production builds, so no ref runs there.
        ref={DEV ? checkStylesheet : undefined}
        role="progressbar"
        aria-label={props.label ?? 'Loading'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow()}
        aria-valuetext={valueText()}
        data-state={controller.state()}
        data-error={controller.error() ? '' : undefined}
        class={['sprogress', props.class]}
        style={{
          ...props.style,
          '--sp-value': controller.value(),
          // Always written, so the CSS transitions run on the same clock as the JS timers.
          '--sp-speed': `${controller.options.speed ?? DEFAULTS.speed}ms`,
        }}
      >
        {/* What `<Bar />` renders, as a static template: no component, spread or effect. */}
        {props.children ?? <div class="sprogress-bar" />}
      </div>
    </ProgressContext>
  )
}

/** The sliding bar: a full-width strip slid in from the inline-start edge. */
export function Bar(props: ParentProps<JSX.HTMLAttributes<HTMLDivElement>>): JSX.Element {
  // The class comes after the spread, so it wins over `props.class`, which it already holds.
  return <div {...props} class={['sprogress-bar', props.class]} />
}
