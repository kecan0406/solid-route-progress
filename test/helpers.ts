import { vi } from 'vitest'
import type { NavigateEventLike } from '../src/navigation-api'

/** Fake timers and rAF only: listing them keeps `performance`, `queueMicrotask` and friends real. */
export const useFakeTimers = () =>
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'Date',
    ],
  })

/** Advance one animation frame so the controller considers the bar painted. */
export const paint = () => vi.advanceTimersByTime(17)

/** A cross-document `navigate` event by default; override `destination` for same-document ones. */
export const navigateEvent = (init: Partial<NavigateEventLike> = {}): NavigateEventLike =>
  Object.assign(new Event('navigate', { cancelable: true }), {
    navigationType: 'push',
    destination: { url: 'https://example.test/next', sameDocument: false },
    canIntercept: false,
    userInitiated: true,
    hashChange: false,
    downloadRequest: null,
    formData: null,
    sourceElement: null,
    ...init,
  }) as NavigateEventLike

export const sameDocument = { url: 'https://example.test/spa', sameDocument: true }

/** `navigateerror` for a navigation that was aborted (a stop, a newer navigation). */
export const abortError = () =>
  new ErrorEvent('navigateerror', { error: new DOMException('aborted', 'AbortError') })

/** `navigateerror` for an intercept handler that rejected. */
export const handlerError = () => new ErrorEvent('navigateerror', { error: new Error('failed') })

/** Install a fake `window.navigation` for the duration of a test. */
export const installNavigation = () => {
  const target = Object.assign(new EventTarget(), { transition: null as object | null })
  ;(globalThis as { navigation?: unknown }).navigation = target
  return {
    target,
    dispatch: (event: Event) => target.dispatchEvent(event),
    uninstall: () => {
      delete (globalThis as { navigation?: unknown }).navigation
    },
  }
}
