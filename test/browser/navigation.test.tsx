import { afterEach, describe, expect, it } from 'vitest'
import { createRoot } from 'solid-js'
import { createProgress } from '../../src'
import { createNavigationProgress } from '../../src/navigation'

/**
 * The platform contract `createNavigationProgress` relies on, against the browser's real
 * `window.navigation` rather than the fake the jsdom tests dispatch on.
 */

interface RealNavigation extends EventTarget {
  navigate(url: string): { committed: Promise<unknown>; finished: Promise<unknown> }
}
type InterceptableEvent = Event & { intercept(options: { handler: () => Promise<void> }): void }

const navigation = (window as unknown as { navigation?: RealNavigation }).navigation
const missing = !navigation

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
/** A same-document URL of the test page that only differs in its query string. */
const url = (name: string) => {
  const next = new URL(location.href)
  next.searchParams.set('sp-test', name)
  return next.href
}

const original = location.href
let cleanup: (() => void)[] = []
afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  history.replaceState(history.state, '', original)
})

function mount() {
  const controller = createProgress({ delay: 0 })
  let starts = 0
  const start = controller.start
  controller.start = () => (starts++, start())
  createRoot((dispose) => {
    createNavigationProgress(controller)
    cleanup.push(dispose)
  })
  return { controller, starts: () => starts }
}

/** Intercept every same-document navigation with `handler`, like a Navigation API router. */
function intercept(handler: () => Promise<void>) {
  const abort = new AbortController()
  navigation!.addEventListener(
    'navigate',
    (event) => (event as InterceptableEvent).intercept({ handler }),
    {
      signal: abort.signal,
    },
  )
  cleanup.push(() => abort.abort())
}

describe('Navigation API (real)', () => {
  it.skipIf(missing)('an intercepted navigation holds the bar until navigatesuccess', async () => {
    const { controller } = mount()
    let succeeded = false
    navigation!.addEventListener('navigatesuccess', () => (succeeded = true), { once: true })
    let finish!: () => void
    intercept(() => new Promise<void>((resolve) => (finish = resolve)))

    const result = navigation!.navigate(url('intercepted'))
    await result.committed
    await frame()
    await frame()
    expect(controller.state()).toBe('trickle')

    finish()
    await result.finished
    expect(succeeded).toBe(true)
    expect(controller.state()).toBe('done')
  })

  it.skipIf(missing)('a plain pushState nobody intercepts is over before it paints', async () => {
    const { controller, starts } = mount()
    history.pushState(null, '', url('pushed'))
    // `navigate` fired and took a hold, and `currententrychange` released it within the call.
    expect(starts()).toBe(1)
    expect(controller.state()).toBe('idle')
    await frame()
    expect(controller.active()).toBe(false)
  })

  it.skipIf(missing)('an intercepted handler that rejects completes as an error', async () => {
    const { controller } = mount()
    let failed = false
    navigation!.addEventListener('navigateerror', () => (failed = true), { once: true })
    let fail!: (reason: unknown) => void
    intercept(() => new Promise<void>((_, reject) => (fail = reject)))

    const result = navigation!.navigate(url('failed'))
    await result.committed
    await frame()
    await frame()
    expect(controller.active()).toBe(true)

    fail(new Error('load failed'))
    await result.finished.catch(() => {})
    expect(failed).toBe(true)
    expect(controller.state()).toBe('done')
    expect(controller.error()).toBe(true)
  })
})
