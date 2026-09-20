import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { cleanup, render, screen } from '@solidjs/testing-library'
import { createProgress } from '../src'
import { createNavigationProgress, NavigationProgress } from '../src/navigation'
import {
  abortError,
  handlerError,
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
  cleanup()
  nav.uninstall()
  vi.useRealTimers()
})

describe('createNavigationProgress', () => {
  it('starts on navigate and completes on navigatesuccess', () => {
    const p = createProgress({ delay: 0 })
    createNavigationProgress(p)
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    expect(p.state()).toBe('trickle')
    paint()
    nav.dispatch(new Event('navigatesuccess'))
    expect(p.state()).toBe('done')
  })

  it('a failed handler completes as an error; an abort fades out', () => {
    const p = createProgress({ delay: 0 })
    createNavigationProgress(p)
    nav.dispatch(navigateEvent({ canIntercept: true }))
    paint()
    nav.dispatch(handlerError())
    expect(p.state()).toBe('done')
    expect(p.error()).toBe(true)
    vi.advanceTimersByTime(200)
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    paint()
    nav.dispatch(abortError())
    expect(p.state()).toBe('idle')
  })

  it('an intercepted navigation keeps going past currententrychange', () => {
    const p = createProgress({ delay: 0 })
    createNavigationProgress(p)
    // `sameDocument` stays `false` until a router intercepts it.
    nav.dispatch(navigateEvent({ canIntercept: true }))
    nav.target.transition = {}
    nav.dispatch(new Event('currententrychange'))
    expect(p.state()).toBe('trickle')
    paint()
    nav.dispatch(new Event('navigatesuccess'))
    expect(p.state()).toBe('done')
  })

  it('a navigation nobody intercepts is over at currententrychange', () => {
    const p = createProgress({ delay: 0 })
    createNavigationProgress(p)
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    paint()
    nav.dispatch(new Event('currententrychange'))
    expect(p.state()).toBe('done')
  })

  it('ignores hash changes, downloads, data-sp-ignore and filtered navigations', () => {
    const p = createProgress({ delay: 0 })
    const filter = vi.fn(() => false)
    createNavigationProgress(p, { filter })
    nav.dispatch(navigateEvent({ destination: sameDocument, hashChange: true }))
    nav.dispatch(navigateEvent({ downloadRequest: 'file.zip' }))
    const a = document.createElement('a')
    a.setAttribute('data-sp-ignore', '')
    nav.dispatch(navigateEvent({ sourceElement: a }))
    expect(filter).not.toHaveBeenCalled()
    nav.dispatch(navigateEvent())
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    expect(filter).toHaveBeenCalledTimes(2)
    expect(p.state()).toBe('idle')
  })

  it('cross-document navigations that never unload time out', () => {
    const p = createProgress({ delay: 0 })
    createNavigationProgress(p, { timeout: 5000 })
    nav.dispatch(navigateEvent())
    paint()
    vi.advanceTimersByTime(5000)
    expect(p.state()).toBe('done')
  })

  it('a bfcache restore drops the bar without a done phase', () => {
    const p = createProgress({ delay: 0 })
    createNavigationProgress(p)
    nav.dispatch(navigateEvent())
    paint()
    window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
    expect(p.state()).toBe('idle')
  })

  it('removes listeners on disposal', () => {
    const p = createProgress({ delay: 0 })
    createRoot((dispose) => {
      createNavigationProgress(p)
      dispose()
    })
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    expect(p.state()).toBe('idle')
  })

  it('says so in development when the Navigation API is missing', () => {
    nav.uninstall()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    createNavigationProgress(createProgress())
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})

describe('<NavigationProgress>', () => {
  it('renders a bar driven by the Navigation API', () => {
    render(() => <NavigationProgress label="Navigating" />)
    const bar = screen.getByRole('progressbar', { name: 'Navigating' })
    nav.dispatch(navigateEvent({ destination: sameDocument }))
    vi.advanceTimersByTime(200)
    expect(bar).toHaveAttribute('data-state', 'trickle')
  })
})
