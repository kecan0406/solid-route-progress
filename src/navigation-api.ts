import { getOwner, onCleanup } from 'solid-js'

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
  addEventListener(
    type: 'navigate',
    listener: (event: NavigateEventLike) => void,
    options?: AddEventListenerOptions | boolean,
  ): void
  addEventListener(
    type: 'navigateerror',
    listener: (event: ErrorEvent) => void,
    options?: AddEventListenerOptions | boolean,
  ): void
  addEventListener(
    type: 'navigatesuccess' | 'currententrychange',
    listener: (event: Event) => void,
    options?: AddEventListenerOptions | boolean,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ): void
}

/** `window.navigation`, or `undefined` where the Navigation API is unavailable. */
export const getNavigation = (): NavigationLike | undefined =>
  (globalThis as { navigation?: NavigationLike }).navigation

/** Anchors (or their ancestors) carrying this attribute never trigger the bar. */
export const IGNORE_ATTRIBUTE = 'data-sp-ignore'

/** Whether `target` is, or sits inside, an element marked `data-sp-ignore`. */
export const isIgnored = (target: EventTarget | null | undefined): boolean =>
  target instanceof Element && target.closest(`[${IGNORE_ATTRIBUTE}]`) !== null

/**
 * An `AbortSignal` that fires when the surrounding Solid owner is disposed. Pass it to
 * `addEventListener` and the listener removes itself.
 */
export function disposalSignal(): AbortSignal {
  const controller = new AbortController()
  if (getOwner()) onCleanup(() => controller.abort())
  return controller.signal
}
