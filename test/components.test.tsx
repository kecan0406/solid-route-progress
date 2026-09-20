import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@solidjs/testing-library'
import { Bar, createProgress, Progress, ProgressProvider, useProgress } from '../src'
import { paint, useFakeTimers } from './helpers'

beforeEach(() => useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('<Progress>', () => {
  it('renders an idle progressbar shell mirroring the controller', () => {
    const controller = createProgress()
    render(() => <Progress controller={controller} />)
    const bar = screen.getByRole('progressbar', { name: 'Loading' })
    expect(bar).toHaveClass('sprogress')
    expect(bar).toHaveAttribute('data-state', 'idle')
    expect(bar).toHaveAttribute('aria-valuenow', '0')
    expect(bar.style.getPropertyValue('--sp-value')).toBe('0')
    expect(bar.style.getPropertyValue('--sp-speed')).toBe('200ms')
    expect(bar.querySelector('.sprogress-bar')).not.toBeNull()
    expect(document.documentElement).not.toHaveAttribute('data-sp-busy')

    controller.start()
    vi.advanceTimersByTime(200)
    expect(bar).toHaveAttribute('data-state', 'trickle')
    expect(bar).not.toHaveAttribute('aria-valuenow') // indeterminate while trickling
    expect(bar.style.getPropertyValue('--sp-value')).toBe('0.95')
    expect(document.documentElement).toHaveAttribute('data-sp-busy')

    controller.set(0.42)
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).not.toHaveAttribute('aria-valuetext')

    paint()
    controller.done()
    vi.advanceTimersByTime(200)
    expect(bar).toHaveAttribute('data-state', 'idle')
    expect(document.documentElement).not.toHaveAttribute('data-sp-busy')
  })

  it('merges class/style and writes --sp-speed from the prop', () => {
    render(() => <Progress class="h-1" label="Busy" speed={320} style={{ '--sp-color': 'red' }} />)
    const bar = screen.getByRole('progressbar', { name: 'Busy' })
    expect(bar).toHaveClass('sprogress', 'h-1')
    expect(bar.style.getPropertyValue('--sp-speed')).toBe('320ms')
    expect(bar.style.getPropertyValue('--sp-color')).toBe('red')
  })

  it('writes --sp-speed from the controller it drives', () => {
    render(() => (
      <ProgressProvider speed={600}>
        <Progress />
      </ProgressProvider>
    ))
    expect(screen.getByRole('progressbar').style.getPropertyValue('--sp-speed')).toBe('600ms')
  })

  it('warns in development when a provided controller makes options moot', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(() => (
      <ProgressProvider>
        <Progress delay={100} speed={300} />
      </ProgressProvider>
    ))
    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/delay, speed ignored/))
    warn.mockRestore()
  })

  it('accepts a custom template that can read the controller', () => {
    const controller = createProgress()
    const Percent = () => <output>{Math.round(useProgress().value() * 100)}%</output>
    render(() => (
      <Progress controller={controller}>
        <Bar class="rounded" />
        <Percent />
      </Progress>
    ))
    expect(document.querySelector('.sprogress-bar')).toHaveClass('rounded')
    controller.set(0.42)
    expect(screen.getByRole('status')).toHaveTextContent('42%')
  })

  it('announces getValueLabel as aria-valuetext for known values only', () => {
    const controller = createProgress({ delay: 0 })
    render(() => (
      <Progress controller={controller} getValueLabel={(percent) => `${percent} percent`} />
    ))
    const bar = screen.getByRole('progressbar')
    controller.start()
    expect(bar).not.toHaveAttribute('aria-valuetext')
    controller.set(0.5)
    expect(bar).toHaveAttribute('aria-valuetext', '50 percent')
  })

  it('mirrors a failed load as data-error during the done phase', () => {
    const controller = createProgress({ delay: 0 })
    render(() => <Progress controller={controller} />)
    const bar = screen.getByRole('progressbar')
    controller.start()
    paint()
    controller.done('error')
    expect(bar).toHaveAttribute('data-error')
    vi.advanceTimersByTime(200)
    expect(bar).not.toHaveAttribute('data-error')
  })

  it('keeps <html data-sp-busy> until the last busy bar goes idle, and sets aria-busy on request', () => {
    const page = createProgress({ delay: 0 })
    const panel = createProgress({ delay: 0 })
    render(() => (
      <>
        <Progress controller={page} ariaBusy />
        <Progress controller={panel} />
      </>
    ))
    const html = document.documentElement
    page.start()
    const release = panel.start()
    paint()
    expect(html).toHaveAttribute('aria-busy', 'true')
    release()
    vi.advanceTimersByTime(200)
    expect(panel.active()).toBe(false)
    expect(html).toHaveAttribute('data-sp-busy')
    page.done()
    vi.advanceTimersByTime(200)
    expect(html).not.toHaveAttribute('data-sp-busy')
    expect(html).not.toHaveAttribute('aria-busy')
  })

  it('opts out of the <html> busy attribute', () => {
    const controller = createProgress()
    render(() => <Progress controller={controller} busyAttribute={false} />)
    controller.start()
    vi.advanceTimersByTime(200)
    expect(controller.active()).toBe(true)
    expect(document.documentElement).not.toHaveAttribute('data-sp-busy')
  })

  it('uses the controller from <ProgressProvider>', () => {
    const controller = createProgress()
    const Trigger = () => {
      const p = useProgress()
      return <button onClick={() => p.start()}>go</button>
    }
    render(() => (
      <ProgressProvider controller={controller}>
        <Progress />
        <Trigger />
      </ProgressProvider>
    ))
    screen.getByRole('button').click()
    vi.advanceTimersByTime(200)
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'trickle')
  })

  it('useProgress() throws outside a provider', () => {
    expect(() => render(() => <>{useProgress().value()}</>)).toThrow(/useProgress/)
  })
})
