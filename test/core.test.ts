import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { createProgress } from '../src/core'
import { paint, useFakeTimers } from './helpers'

beforeEach(() => useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('createProgress', () => {
  it('starts hidden', () => {
    const p = createProgress()
    expect(p.state()).toBe('idle')
    expect(p.value()).toBe(0)
    expect(p.active()).toBe(false)
  })

  it('start() reveals the bar after `delay` and targets the trickle value', () => {
    const p = createProgress()
    p.start()
    vi.advanceTimersByTime(199)
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(1)
    expect(p.state()).toBe('trickle')
    expect(p.value()).toBe(0.95)
    expect(p.active()).toBe(true)
    p.start()
    expect(p.state()).toBe('trickle')
  })

  it('done() before the first paint drops the bar without a done phase', () => {
    const p = createProgress({ delay: 0 })
    p.start()
    expect(p.state()).toBe('trickle')
    p.done()
    expect(p.state()).toBe('idle')
    expect(p.value()).toBe(0)
  })

  it('done() after paint completes, then hides after `speed`', () => {
    const p = createProgress({ speed: 150, delay: 0 })
    p.start()
    paint()
    p.done()
    expect(p.state()).toBe('done')
    expect(p.value()).toBe(1)
    vi.advanceTimersByTime(149)
    expect(p.state()).toBe('done')
    vi.advanceTimersByTime(1)
    expect(p.state()).toBe('idle')
    expect(p.value()).toBe(0)
  })

  it('done() while hidden is a no-op', () => {
    const p = createProgress()
    p.done()
    expect(p.state()).toBe('idle')
  })

  it('`delay` hides loads that finish early', () => {
    const p = createProgress()
    p.start()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(150)
    p.done()
    vi.advanceTimersByTime(200)
    expect(p.state()).toBe('idle')

    p.start()
    vi.advanceTimersByTime(200)
    expect(p.state()).toBe('trickle')
  })

  it('`stopDelay` defers done() and a new start() cancels it', () => {
    const p = createProgress({ stopDelay: 300, delay: 0 })
    p.start()
    paint()
    p.done()
    expect(p.state()).toBe('trickle')
    p.start()
    vi.advanceTimersByTime(300)
    expect(p.state()).toBe('trickle')
    p.done()
    vi.advanceTimersByTime(300)
    expect(p.state()).toBe('done')
  })

  it('set() hops to the value, then resumes trickling', () => {
    const p = createProgress({ delay: 0 })
    p.start()
    paint()
    p.set(0.5)
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.5)
    vi.advanceTimersByTime(200)
    expect(p.state()).toBe('trickle')
    expect(p.value()).toBe(0.95)
  })

  it('set() past the trickle target holds there', () => {
    const p = createProgress({ delay: 0 })
    p.start()
    p.set(0.97)
    vi.advanceTimersByTime(500)
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.97)
  })

  it('set(1) completes and set() while hidden reveals', () => {
    const p = createProgress()
    p.set(0.3)
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.3)
    paint()
    p.set(1)
    expect(p.state()).toBe('done')
    p.set(0.5)
    expect(p.state()).toBe('done')
  })

  it('set() clamps out-of-range values', () => {
    const p = createProgress()
    p.set(-1)
    expect(p.value()).toBe(0)
    expect(p.state()).toBe('active')
  })

  it('start() during the done phase waits for the fade before restarting', () => {
    const p = createProgress({ delay: 0 })
    p.start()
    paint()
    p.done()
    p.start()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(200)
    expect(p.state()).toBe('trickle')
  })

  it('start() during the done phase still waits for `delay` when it outlasts the fade', () => {
    const p = createProgress({ delay: 600 })
    const first = p.start()
    vi.advanceTimersByTime(600)
    paint()
    first()
    expect(p.state()).toBe('done')
    p.start()
    vi.advanceTimersByTime(599)
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(1)
    expect(p.state()).toBe('trickle')
  })

  it('reads options lazily so reactive props work', () => {
    const options = { delay: 0 }
    const p = createProgress(options)
    options.delay = 100
    p.start()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(100)
    expect(p.state()).toBe('trickle')
  })

  it('track() shows the bar until the last tracked promise settles', async () => {
    const p = createProgress({ delay: 0 })
    let resolveA!: () => void
    let rejectB!: (reason: unknown) => void
    const a = new Promise<void>((resolve) => (resolveA = resolve))
    const b = new Promise<void>((_, reject) => (rejectB = reject))
    expect(p.track(a)).toBe(a)
    p.track(b)
    expect(p.state()).toBe('trickle')
    paint()
    resolveA()
    await a
    expect(p.state()).toBe('trickle')
    rejectB(new Error('failed'))
    await b.catch(() => {})
    expect(p.state()).toBe('done')
    expect(p.error()).toBe(true)
    vi.advanceTimersByTime(200)
    expect(p.error()).toBe(false)
  })

  it('track() lets go after `timeout` when the promise never settles', () => {
    const p = createProgress({ delay: 0 })
    p.track(new Promise(() => {}), { timeout: 1000 })
    paint()
    vi.advanceTimersByTime(1000 - 17 - 1)
    expect(p.state()).toBe('trickle')
    vi.advanceTimersByTime(1)
    expect(p.state()).toBe('done')
  })

  it("outcomes: 'error' wins over later releases, 'cancel' fades out without a done phase", () => {
    const p = createProgress({ delay: 0 })
    const a = p.start()
    const b = p.start()
    paint()
    a('error')
    expect(p.state()).toBe('trickle')
    b('cancel')
    expect(p.state()).toBe('done')
    expect(p.error()).toBe(true)
    vi.advanceTimersByTime(200)

    const c = p.start()
    paint()
    c('cancel')
    expect(p.state()).toBe('idle') // faded out without running to 100%
    expect(p.error()).toBe(false)

    p.start()
    paint()
    p.done('error')
    expect(p.error()).toBe(true)
  })

  it('a release is also a disposable where Symbol.dispose exists', () => {
    const dispose = (Symbol as { dispose?: symbol }).dispose
    if (!dispose) return
    const p = createProgress({ delay: 0 })
    const release = p.start() as unknown as Record<symbol, () => void>
    paint()
    release[dispose]!()
    expect(p.state()).toBe('done')
  })

  it('a release only ends its own hold; done() drops every hold', async () => {
    const p = createProgress({ delay: 0 })
    let resolve!: () => void
    const load = new Promise<void>((r) => (resolve = r))
    p.track(load)
    const release = p.start() // e.g. the router, finishing its navigation first
    paint()
    release()
    release()
    expect(p.state()).toBe('trickle')
    resolve()
    await load
    expect(p.state()).toBe('done')

    vi.advanceTimersByTime(200)
    const late = p.start()
    paint()
    p.done()
    expect(p.state()).toBe('done')
    vi.advanceTimersByTime(200)
    p.start()
    late() // dropped by done(): releasing it does not end the new load
    expect(p.state()).toBe('trickle')
  })

  it('clears timers on owner disposal', () => {
    createRoot((dispose) => {
      const p = createProgress({ delay: 100 })
      p.start()
      dispose()
      vi.advanceTimersByTime(100)
      expect(p.state()).toBe('idle')
    })
  })
})
