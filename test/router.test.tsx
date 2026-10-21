import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@solidjs/testing-library'
import {
  createRouter,
  memoryHistory,
  useLocation,
  useNavigate,
  type Location,
  type Navigator,
} from '@solidjs/router'
import { createMemo, Loading } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createProgress, ProgressProvider, useProgress, type ProgressController } from '../src'
import { RouteProgress, type RouteProgressOptions } from '../src/router'
import { update, useFakeTimers } from './helpers'

beforeEach(() => useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const load = (url: string) => new Promise<string>((resolve) => setTimeout(() => resolve(url), 50))

/** A page whose data follows the URL, so every navigation to it waits on a load. */
const Page = () => {
  const location = useLocation()
  const data = createMemo(() => load(location.pathname + location.search))
  return <p>{data()}</p>
}

const routes = [
  { path: '/', component: Page },
  { path: '/a', component: Page },
  { path: '/b', component: Page },
]

const settle = async () => {
  await vi.runAllTimersAsync()
}

async function mount(options: RouteProgressOptions = {}, extra?: () => JSX.Element) {
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
  const history = memoryHistory('/')
  const Router = createRouter({ routes, history })
  render(() => (
    <Router>
      {(props) => (
        <>
          <RouteProgress controller={controller} crossDocument={false} {...options} />
          <Capture />
          {extra?.()}
          <Loading>{props.children}</Loading>
        </>
      )}
    </Router>
  ))
  // The first page's own load is no navigation.
  await settle()
  return { controller, start, release, navigate: (to: string) => navigate(to), history }
}

describe('<RouteProgress>', () => {
  it('renders the bar and starts/completes around a navigation', async () => {
    const { start, release, navigate } = await mount()
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'idle')
    expect(start).not.toHaveBeenCalled()
    navigate('/a')
    await update()
    expect(start).toHaveBeenCalledTimes(1)
    await settle()
    expect(release).toHaveBeenCalledOnce()
  })

  it('does not start for navigations the router drops (same target)', async () => {
    const { start, navigate } = await mount()
    navigate('/')
    await settle()
    expect(start).not.toHaveBeenCalled()
  })

  it('`shallow` skips navigations that keep the pathname', async () => {
    const { start, navigate } = await mount({ shallow: true })
    navigate('/?q=1')
    await settle()
    expect(start).not.toHaveBeenCalled()
    navigate('/a?q=1')
    await update()
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
    const { start, navigate } = await mount({ filter })
    navigate('/b')
    await settle()
    expect(seen).toEqual([['/b', '/']])
    expect(start).not.toHaveBeenCalled()
    navigate('/a')
    await update()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('a skipped navigation does not poison a later back/forward one', async () => {
    const { start, navigate, history } = await mount({ filter: (to) => to !== '/b' })
    navigate('/b')
    await settle()
    history.back()
    await update()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('back/forward goes through `filter` too', async () => {
    const { start, navigate, history } = await mount({ filter: (to) => to !== '/' })
    navigate('/a')
    await settle()
    expect(start).toHaveBeenCalledTimes(1)
    history.back()
    await settle()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('`data-sp-ignore` links never start the bar', async () => {
    const { start } = await mount({}, () => (
      <>
        <a href="/a" data-sp-ignore>
          ignored
        </a>
        <a href="/b">tracked</a>
      </>
    ))
    screen.getByText('ignored').click()
    await settle()
    expect(start).not.toHaveBeenCalled()
    screen.getByText('tracked').click()
    await update()
    expect(start).toHaveBeenCalledTimes(1)
  })

  it('drives a surrounding <ProgressProvider> so useProgress() works anywhere', async () => {
    let fromPage!: ProgressController
    const PageWithHook = () => {
      fromPage = useProgress()
      return <p>page</p>
    }
    const provided = createProgress()
    const Router = createRouter({
      routes: [{ path: '/', component: PageWithHook }],
      history: memoryHistory('/'),
    })
    render(() => (
      <Router>
        {(props) => (
          <ProgressProvider controller={provided}>
            <RouteProgress crossDocument={false} />
            {props.children}
          </ProgressProvider>
        )}
      </Router>
    ))
    expect(fromPage).toBe(provided)
    provided.start()
    vi.advanceTimersByTime(200)
    await update()
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-state', 'trickle')
  })
})

describe('<RouteProgress> inside <ProgressProvider>', () => {
  it('warns that options belong on the provider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Router = createRouter({
      routes: [{ path: '/', component: () => <p>page</p> }],
      history: memoryHistory('/'),
    })
    render(() => (
      <Router>
        {(props) => (
          <ProgressProvider>
            <RouteProgress crossDocument={false} delay={100} />
            {props.children}
          </ProgressProvider>
        )}
      </Router>
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
