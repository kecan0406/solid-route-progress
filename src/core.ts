import { batch, createSignal, getOwner, onCleanup, type Accessor } from 'solid-js'
import { isServer } from 'solid-js/web'

/**
 * Visual state of the bar. Mirrored to the root element as `data-state`.
 *
 * - `idle`     hidden (faded out, `visibility: hidden`)
 * - `trickle`  visible, drifting toward `trickleTo` on a long CSS transition
 * - `active`   visible, moving to an explicit `set()` value on a short transition
 * - `done`     visible, moving to 100% before fading out
 */
export type ProgressState = 'idle' | 'trickle' | 'active' | 'done'

/**
 * How a load ended, when it did not simply succeed: `'error'` completes the bar with
 * `data-error` set, `'cancel'` fades it out without running to 100%.
 */
export type Outcome = 'error' | 'cancel'

/**
 * `{ [Symbol.dispose](): void }` where the consumer's TypeScript `lib` knows `Symbol.dispose`,
 * and no constraint otherwise, so the type never forces `esnext.disposable` on anyone.
 */
export type DisposableLike = SymbolConstructor extends { readonly dispose: infer K extends symbol }
  ? { [P in K]: () => void }
  : unknown

/**
 * Lets go of one hold on the bar. Calling it again is a no-op. Where `Symbol.dispose`
 * exists it is also a disposable, so `using hold = progress.start()` releases on scope exit.
 */
export type Release = ((outcome?: Outcome) => void) & DisposableLike

export interface TrackOptions {
  /** Release the hold after this many milliseconds even if the promise never settles. */
  timeout?: number
}

export interface ProgressOptions {
  /**
   * Value (0–1) the bar drifts toward while loading. The drift itself is a single CSS
   * transition (`--sp-trickle-duration` / `--sp-trickle-easing`); no JS timer steps it.
   * @default 0.95
   */
  trickleTo?: number
  /**
   * Milliseconds a load must last before the bar shows, so quick loads never draw one. A
   * load that settles before the next frame is dropped unseen even with `0`.
   * @default 200
   */
  delay?: number
  /**
   * Milliseconds to wait before completing once the last hold is released. Useful when a
   * route mounts and immediately kicks off another load you also want covered.
   * @default 0
   */
  stopDelay?: number
  /**
   * Milliseconds for the short transitions: `set()`, `done()` and the fade in/out. The bar
   * writes it to `--sp-speed`, so JS timers and CSS transitions always agree.
   * @default 200
   */
  speed?: number
}

export interface ProgressController {
  /** Target value (0–1) the bar is transitioning toward. */
  readonly value: Accessor<number>
  /** Current visual state. */
  readonly state: Accessor<ProgressState>
  /** `true` while the bar is visible (any state other than `idle`). */
  readonly active: Accessor<boolean>
  /** `true` during the `done` phase of a load that failed. Mirrored as `data-error`. */
  readonly error: Accessor<boolean>
  /**
   * Hold the bar open: shows it (after `delay`) and starts trickling. Returns a release
   * function; the bar completes once every hold is released, so the router, `track()` and
   * your own code never finish each other's loads.
   */
  start(): Release
  /**
   * Complete the bar (after `stopDelay`), dropping every hold. No-op while hidden. An
   * `outcome` marks the load as failed or canceled, as with a release.
   */
  done(outcome?: Outcome): void
  /**
   * Move the bar to an explicit value (0–1) on a short transition, then resume
   * trickling. Values `>= 1` complete the bar. Shows the bar if it is hidden, except
   * while a `delay` is still pending: a load that finishes early stays invisible.
   */
  set(value: number): void
  /**
   * Hold the bar open until `promise` settles; a rejection ends it as an `'error'`. Returns
   * `promise` itself, so it can wrap a call in place.
   */
  track<P extends PromiseLike<unknown>>(promise: P, options?: TrackOptions): P
  /** The options this controller was created with (read lazily, so reactive props work). */
  readonly options: ProgressOptions
}

/** `Symbol.dispose` where the runtime has it. */
const dispose = (Symbol as { dispose?: symbol }).dispose

export const DEFAULTS: Required<ProgressOptions> = {
  trickleTo: 0.95,
  delay: 200,
  stopDelay: 0,
  speed: 200,
}

/**
 * Headless progress state machine. Rendering is left to CSS: the controller only
 * exposes a target `value` and a `state`, which `<Progress>` mirrors to
 * `--sp-value` and `data-state`.
 */
export function createProgress(options: ProgressOptions = {}): ProgressController {
  const [value, setValue] = createSignal(0)
  const [state, setState] = createSignal<ProgressState>('idle')
  const [error, setError] = createSignal(false)
  const opt = <K extends keyof typeof DEFAULTS>(key: K): (typeof DEFAULTS)[K] =>
    options[key] ?? DEFAULTS[key]
  const holds = new Set<object>()

  // Timers are `ReturnType<typeof setTimeout>` so the same code type-checks under DOM and Node libs.
  /** The one scheduled step: reveal while `idle`, resume trickling while `active`, hide while `done`. */
  let timer: ReturnType<typeof setTimeout> | undefined
  let stopTimer: ReturnType<typeof setTimeout> | undefined
  /** `true` once the browser has had a chance to paint the visible bar. */
  let painted = false
  /** A hold was released as an `'error'` during the current load. */
  let failed = false

  const schedule = (step: () => void, ms: number) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      step()
    }, ms)
  }
  const cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }
  /** A reveal is scheduled: the load has not lasted `delay` yet. */
  const pending = () => state() === 'idle' && timer !== undefined

  const move = (s: ProgressState, v: number) =>
    batch(() => {
      setState(s)
      setValue(v)
    })
  const hide = () => {
    failed = false
    batch(() => {
      setError(false)
      move('idle', 0)
    })
  }
  const drop = () => {
    cancel()
    hide()
  }
  const reveal = (s: ProgressState, v: number) => {
    painted = false
    requestAnimationFrame(() => (painted = true))
    move(s, v)
  }
  const show = () => reveal('trickle', opt('trickleTo'))

  const finish = () => {
    // Nothing was ever painted: drop the bar silently instead of flashing it.
    if (!painted) return drop()
    batch(() => {
      setError(failed)
      move('done', 1)
    })
    schedule(hide, opt('speed'))
  }

  /** Every hold is gone: complete or drop the bar, or cancel a reveal that is not due yet. */
  const settle = (canceled: boolean) => {
    const s = state()
    if (s === 'trickle' || s === 'active') {
      const end = canceled && !failed ? drop : finish
      const stopDelay = opt('stopDelay')
      clearTimeout(stopTimer)
      if (stopDelay > 0) stopTimer = setTimeout(end, stopDelay)
      else end()
    } else if (s === 'idle') {
      // Nothing shown, and nothing left to report.
      cancel()
      failed = false
    }
  }

  const release = (hold: object, outcome?: Outcome) => {
    if (!holds.delete(hold)) return
    if (outcome === 'error') failed = true
    if (!holds.size) settle(outcome === 'cancel')
  }

  const start = (): Release => {
    const hold = {}
    if (!isServer) {
      holds.add(hold)
      // A pending stop is superseded by the new load.
      clearTimeout(stopTimer)
      const s = state()
      // Let a completed bar fade out fully before starting a fresh one, otherwise it would
      // visibly travel backwards from 100% to the trickle target.
      if (s === 'done') {
        hide()
        schedule(show, opt('speed'))
      } else if (s === 'idle' && !pending()) {
        const delay = opt('delay')
        if (delay > 0) schedule(show, delay)
        else show()
      }
    }
    const releaseHold = (outcome?: Outcome) => release(hold, outcome)
    if (dispose) (releaseHold as unknown as Record<symbol, () => void>)[dispose] = releaseHold
    return releaseHold as Release
  }

  const done = (outcome?: Outcome) => {
    holds.clear()
    if (outcome === 'error') failed = true
    settle(outcome === 'cancel')
  }

  const set = (n: number) => {
    if (isServer) return
    n = Math.min(1, Math.max(0, n))
    if (n === 1) return done()
    const s = state()
    if (s === 'done' || pending()) return
    // Revealing from `idle` in the same batch runs the transition from `--sp-start`.
    if (s === 'idle') reveal('active', n)
    else move('active', n)
    // Once the short hop lands, hand control back to the CSS trickle — unless the explicit
    // value already sits past the trickle target, in which case hold there.
    const trickleTo = opt('trickleTo')
    if (n < trickleTo) schedule(() => move('trickle', trickleTo), opt('speed'))
    else cancel()
  }

  const track = <P extends PromiseLike<unknown>>(promise: P, options?: TrackOptions): P => {
    const releaseHold = start()
    promise.then(
      () => releaseHold(),
      () => releaseHold('error'),
    )
    const timeout = options?.timeout
    if (timeout && !isServer) setTimeout(releaseHold, timeout)
    return promise
  }

  if (getOwner())
    onCleanup(() => {
      clearTimeout(timer)
      clearTimeout(stopTimer)
    })

  return { value, state, error, active: () => state() !== 'idle', start, done, set, track, options }
}
