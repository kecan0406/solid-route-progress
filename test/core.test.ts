import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { action, createRoot } from 'solid-js'
import { createProgress } from '../src/core'
import { paint, update, useFakeTimers } from './helpers'

beforeEach(() => useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('createProgress', () => {
  it('starts hidden', () => {
    const p = createProgress()
    expect(p.state()).toBe('idle')
    expect(p.value()).toBe(0)
    expect(p.active()).toBe(false)
  })

  it('start() reveals the bar after `delay` and targets the trickle value', async () => {
    const p = createProgress()
    p.start()
    vi.advanceTimersByTime(199)
    await update()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(1)
    await update()
    expect(p.state()).toBe('trickle')
    expect(p.value()).toBe(0.95)
    expect(p.active()).toBe(true)
    p.start()
    await update()
    expect(p.state()).toBe('trickle')
  })

  it('publishes on a microtask, one update for moves made in one go', async () => {
    const p = createProgress({ delay: 0 })
    p.start()
    expect(p.state()).toBe('idle')
    p.set(0.5)
    await update()
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.5)
  })

  it('done() before the first paint drops the bar without a done phase', async () => {
    const p = createProgress({ delay: 0 })
    p.start()
    await update()
    expect(p.state()).toBe('trickle')
    p.done()
    await update()
    expect(p.state()).toBe('idle')
    expect(p.value()).toBe(0)
  })

  it('done() after paint completes, then hides after `speed`', async () => {
    const p = createProgress({ speed: 150, delay: 0 })
    p.start()
    paint()
    p.done()
    await update()
    expect(p.state()).toBe('done')
    expect(p.value()).toBe(1)
    vi.advanceTimersByTime(149)
    await update()
    expect(p.state()).toBe('done')
    vi.advanceTimersByTime(1)
    await update()
    expect(p.state()).toBe('idle')
    expect(p.value()).toBe(0)
  })

  it('done() while hidden is a no-op', async () => {
    const p = createProgress()
    p.done()
    await update()
    expect(p.state()).toBe('idle')
  })

  it('`delay` hides loads that finish early', async () => {
    const p = createProgress()
    p.start()
    await update()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(150)
    p.done()
    vi.advanceTimersByTime(200)
    await update()
    expect(p.state()).toBe('idle')

    p.start()
    vi.advanceTimersByTime(200)
    await update()
    expect(p.state()).toBe('trickle')
  })

  it('`stopDelay` defers done() and a new start() cancels it', async () => {
    const p = createProgress({ stopDelay: 300, delay: 0 })
    p.start()
    paint()
    p.done()
    await update()
    expect(p.state()).toBe('trickle')
    p.start()
    vi.advanceTimersByTime(300)
    await update()
    expect(p.state()).toBe('trickle')
    p.done()
    vi.advanceTimersByTime(300)
    await update()
    expect(p.state()).toBe('done')
  })

  it('set() hops to the value, then resumes trickling', async () => {
    const p = createProgress({ delay: 0 })
    p.start()
    paint()
    p.set(0.5)
    await update()
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.5)
    vi.advanceTimersByTime(200)
    await update()
    expect(p.state()).toBe('trickle')
    expect(p.value()).toBe(0.95)
  })

  it('set() past the trickle target holds there', async () => {
    const p = createProgress({ delay: 0 })
    p.start()
    p.set(0.97)
    vi.advanceTimersByTime(500)
    await update()
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.97)
  })

  it('set(1) completes and set() while hidden reveals', async () => {
    const p = createProgress()
    p.set(0.3)
    await update()
    expect(p.state()).toBe('active')
    expect(p.value()).toBe(0.3)
    paint()
    p.set(1)
    await update()
    expect(p.state()).toBe('done')
    p.set(0.5)
    await update()
    expect(p.state()).toBe('done')
  })

  it('set() clamps out-of-range values', async () => {
    const p = createProgress()
    p.set(-1)
    await update()
    expect(p.value()).toBe(0)
    expect(p.state()).toBe('active')
  })

  it('start() during the done phase waits for the fade before restarting', async () => {
    const p = createProgress({ delay: 0 })
    p.start()
    paint()
    p.done()
    p.start()
    await update()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(200)
    await update()
    expect(p.state()).toBe('trickle')
  })

  it('start() during the done phase still waits for `delay` when it outlasts the fade', async () => {
    const p = createProgress({ delay: 600 })
    const first = p.start()
    vi.advanceTimersByTime(600)
    paint()
    first()
    await update()
    expect(p.state()).toBe('done')
    p.start()
    vi.advanceTimersByTime(599)
    await update()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(1)
    await update()
    expect(p.state()).toBe('trickle')
  })

  it('reads options lazily so reactive props work', async () => {
    const options = { delay: 0 }
    const p = createProgress(options)
    options.delay = 100
    p.start()
    await update()
    expect(p.state()).toBe('idle')
    vi.advanceTimersByTime(100)
    await update()
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
    await update()
    expect(p.state()).toBe('trickle')
    paint()
    resolveA()
    await a
    await update()
    expect(p.state()).toBe('trickle')
    rejectB(new Error('failed'))
    await b.catch(() => {})
    await update()
    expect(p.state()).toBe('done')
    expect(p.error()).toBe(true)
    vi.advanceTimersByTime(200)
    await update()
    expect(p.error()).toBe(false)
  })

  it('track() lets go after `timeout` when the promise never settles', async () => {
    const p = createProgress({ delay: 0 })
    p.track(new Promise(() => {}), { timeout: 1000 })
    paint()
    vi.advanceTimersByTime(1000 - 17 - 1)
    await update()
    expect(p.state()).toBe('trickle')
    vi.advanceTimersByTime(1)
    await update()
    expect(p.state()).toBe('done')
  })

  it('shows inside an action() while it is in flight, not when its transition commits', async () => {
    const p = createProgress({ delay: 0 })
    let resolve!: () => void
    const save = action(function* () {
      yield p.track(new Promise<void>((r) => (resolve = r)))
    })
    const saved = save()
    await update()
    expect(p.state()).toBe('trickle')
    paint()
    resolve()
    await saved
    await update()
    expect(p.state()).toBe('done')
  })

  it("outcomes: 'error' wins over later releases, 'cancel' fades out without a done phase", async () => {
    const p = createProgress({ delay: 0 })
    const a = p.start()
    const b = p.start()
    paint()
    a('error')
    await update()
    expect(p.state()).toBe('trickle')
    b('cancel')
    await update()
    expect(p.state()).toBe('done')
    expect(p.error()).toBe(true)
    vi.advanceTimersByTime(200)

    const c = p.start()
    paint()
    c('cancel')
    await update()
    expect(p.state()).toBe('idle') // faded out without running to 100%
    expect(p.error()).toBe(false)

    p.start()
    paint()
    p.done('error')
    await update()
    expect(p.error()).toBe(true)
  })

  it('a release is also a disposable where Symbol.dispose exists', async () => {
    const dispose = (Symbol as { dispose?: symbol }).dispose
    if (!dispose) return
    const p = createProgress({ delay: 0 })
    const release = p.start() as unknown as Record<symbol, () => void>
    paint()
    release[dispose]!()
    await update()
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
    await update()
    expect(p.state()).toBe('trickle')
    resolve()
    await load
    await update()
    expect(p.state()).toBe('done')

    vi.advanceTimersByTime(200)
    const late = p.start()
    paint()
    p.done()
    await update()
    expect(p.state()).toBe('done')
    vi.advanceTimersByTime(200)
    p.start()
    late() // dropped by done(): releasing it does not end the new load
    await update()
    expect(p.state()).toBe('trickle')
  })

  it('clears timers on owner disposal', async () => {
    const p = createRoot((dispose) => {
      const p = createProgress({ delay: 100 })
      p.start()
      dispose()
      return p
    })
    vi.advanceTimersByTime(100)
    await update()
    expect(p.state()).toBe('idle')
  })
})
