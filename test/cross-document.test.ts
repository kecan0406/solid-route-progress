import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { createCrossDocumentProgress, createProgress } from '../src'
import {
  abortError,
  installNavigation,
  navigateEvent,
  paint,
  sameDocument,
  useFakeTimers,
} from './helpers'

let nav: ReturnType<typeof installNavigation>
beforeEach(() => {
  useFakeTimers()
  nav = installNavigation()
})
afterEach(() => {
  nav.uninstall()
  vi.useRealTimers()
})

describe('createCrossDocumentProgress', () => {
  it('starts only for navigations that leave the document', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p)
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    expect(p.state()).toBe('idle')
    nav.dispatch(navigateEvent({ downloadRequest: 'a.pdf' }))
    expect(p.state()).toBe('idle')
    nav.dispatch(
      navigateEvent({ destination: { url: 'mailto:hi@example.test', sameDocument: false } }),
    )
    expect(p.state()).toBe('idle')
    nav.dispatch(navigateEvent({ navigationType: 'reload' }))
    expect(p.state()).toBe('trickle')
  })

  it('`filter` decides per navigation', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p, { filter: (event) => event.navigationType !== 'reload' })
    nav.dispatch(navigateEvent({ navigationType: 'reload' }))
    expect(p.state()).toBe('idle')
    nav.dispatch(navigateEvent())
    expect(p.state()).toBe('trickle')
  })

  it('times out canceled navigations and honours timeout: 0', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p, { timeout: 0 })
    nav.dispatch(navigateEvent())
    paint()
    vi.advanceTimersByTime(60_000)
    expect(p.state()).toBe('trickle')
  })

  it('a bfcache restore disarms the safety timeout', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p, { timeout: 10_000 })
    nav.dispatch(navigateEvent())
    paint()
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
    vi.advanceTimersByTime(300)
    p.start() // a later, unrelated load
    paint()
    vi.advanceTimersByTime(10_000)
    expect(p.state()).toBe('trickle')
  })

  it('fades out when its navigation is aborted, ignoring errors it did not start', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p)
    nav.dispatch(navigateEvent())
    paint()
    nav.dispatch(abortError())
    expect(p.state()).toBe('idle')
    p.start()
    paint()
    nav.dispatch(abortError())
    expect(p.state()).toBe('trickle')
  })

  it('a navigation a router intercepts ends on navigatesuccess, not the safety net', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p, { timeout: 1000 })
    nav.dispatch(navigateEvent({ canIntercept: true }))
    nav.target.transition = {}
    nav.dispatch(new Event('currententrychange'))
    paint()
    vi.advanceTimersByTime(5000)
    expect(p.state()).toBe('trickle')
    nav.dispatch(new Event('navigatesuccess'))
    expect(p.state()).toBe('done')
  })

  it('skips navigations another listener canceled', () => {
    const p = createProgress({ delay: 0 })
    createCrossDocumentProgress(p)
    const event = navigateEvent()
    event.preventDefault()
    nav.dispatch(event)
    expect(p.state()).toBe('idle')
  })

  it('removes listeners on disposal', () => {
    const p = createProgress({ delay: 0 })
    createRoot((dispose) => {
      createCrossDocumentProgress(p)
      dispose()
    })
    nav.dispatch(navigateEvent())
    expect(p.state()).toBe('idle')
  })
})
