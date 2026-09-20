import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@solidjs/testing-library'
import {
  A,
  createMemoryHistory,
  MemoryRouter,
  Route,
  useNavigate,
  type Location,
  type Navigator,
} from '@solidjs/router'
import type { JSX } from 'solid-js'
import { createProgress, ProgressProvider, useProgress, type ProgressController } from '../src'
import { RouteProgress, type RouteProgressOptions } from '../src/router'
import { useFakeTimers } from './helpers'

beforeEach(() => useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const Page = () => <p>page</p>

function mount(options: RouteProgressOptions = {}, extra?: () => JSX.Element) {
  const controller = createProgress()
  const hold = controller.start
  const release = vi.fn()
  const start = vi.spyOn(controller, 'start').mockImplementation(() => {
    const releaseHold = hold()
    return () => {
      release()
      releaseHold()
    }
  })
  let navigate!: Navigator
  const Capture = () => {
    navigate = useNavigate()
    return null
  }
  const history = createMemoryHistory()
  render(() => (
    <MemoryRouter
      history={history}
      root={(props) => (
        <>
          <RouteProgress controller={controller} crossDocument={false} {...options} />
          <Capture />
          {extra?.()}
          {props.children}
        </>
      )}
    >
      <Route path="/" component={Page} />
      <Route path="/a" component={Page} />
      <Route path="/b" component={Page} />
    </MemoryRouter>
  ))
  return { controller, start, release, navigate: (to: string) => navigate(to), history }
}

const settle = async () => {
  await vi.runAllTimersAsync()
}

describe('<RouteProgress>', () => {
  it('renders the bar and starts/completes around a navigation', async () => {
    const { start, release, navigate } = mount()
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'idle')
    expect(start).not.toHaveBeenCalled()
    navigate('/a')
    expect(start).toHaveBeenCalledTimes(1)
    await settle()
    expect(release).toHaveBeenCalledOnce()
  })

  it('does not start for navigations the router drops (same target)', async () => {
    const { start, navigate } = mount()
    navigate('/')
    await settle()
    expect(start).not.toHaveBeenCalled()
  })

  it('`shallow` skips navigations that keep the pathname', async () => {
    const { start, navigate } = mount({ shallow: true })
    navigate('/?q=1')
    await settle()
    expect(start).not.toHaveBeenCalled()
    navigate('/a?q=1')
    expect(start).toHaveBeenCalledTimes(1)
    await settle()
    navigate('/a/#hash')
    await settle()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('`filter` decides per navigation', async () => {
    const seen: [string, string][] = []
    const filter = vi.fn((to: string, from: Location) => {
      seen.push([to, from.pathname])
      return to !== '/b'
    })
    const { start, navigate } = mount({ filter })
    navigate('/b')
    await settle()
    expect(seen).toEqual([['/b', '/']])
    expect(start).not.toHaveBeenCalled()
    navigate('/a')
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('a skipped navigation does not poison a later native one', async () => {
    const { start, navigate, history } = mount({ filter: (to) => to !== '/b' })
    navigate('/b')
    await settle()
    history.set({ value: '/a' })
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('`data-sp-ignore` links never start the bar', async () => {
    const { start } = mount({}, () => (
      <>
        <A href="/a" data-sp-ignore>
          ignored
        </A>
        <A href="/b">tracked</A>
      </>
    ))
    screen.getByText('ignored').click()
    await settle()
    expect(start).not.toHaveBeenCalled()
    screen.getByText('tracked').click()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('drives a surrounding <ProgressProvider> so useProgress() works anywhere', () => {
    let fromPage!: ProgressController
    const PageWithHook = () => {
      fromPage = useProgress()
      return <p>page</p>
    }
    const provided = createProgress()
    render(() => (
      <MemoryRouter
        history={createMemoryHistory()}
        root={(props) => (
          <ProgressProvider controller={provided}>
            <RouteProgress crossDocument={false} />
            {props.children}
          </ProgressProvider>
        )}
      >
        <Route path="/" component={PageWithHook} />
      </MemoryRouter>
    ))
    expect(fromPage).toBe(provided)
    provided.start()
    vi.advanceTimersByTime(200)
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'trickle')
  })
})

describe('<RouteProgress> inside <ProgressProvider>', () => {
  it('warns that options belong on the provider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(() => (
      <MemoryRouter
        history={createMemoryHistory()}
        root={(props) => (
          <ProgressProvider>
            <RouteProgress crossDocument={false} delay={100} />
            {props.children}
          </ProgressProvider>
        )}
      >
        <Route path="/" component={Page} />
      </MemoryRouter>
    ))
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/delay ignored/))
    warn.mockRestore()
  })
})

describe('RouteProgress typing', () => {
  it('accepts every Progress prop', () => {
    // Type-level only: never rendered, since router primitives need a <Router>.
    const usage = (c: ProgressController) => (
      <RouteProgress controller={c} delay={80} speed={250} class="x" label="Loading page" />
    )
    expect(usage).toBeTypeOf('function')
  })

  it('rejects props the bar owns or of the wrong type', () => {
    const misuse = (c: ProgressController) => (
      <>
        {/* @ts-expect-error the bar owns its role */}
        <RouteProgress controller={c} role="status" />
        {/* @ts-expect-error `shallow` is a boolean */}
        <RouteProgress shallow="yes" />
      </>
    )
    expect(misuse).toBeTypeOf('function')
  })
})
