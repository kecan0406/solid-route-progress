import { describe, expect, it } from 'vitest'
import { renderToString } from 'solid-js/web'
import { Route, Router } from '@solidjs/router'
import { createProgress, Progress } from '../../src'
import { RouteProgress } from '../../src/router'

describe('server rendering', () => {
  it('renders the idle shell', () => {
    const html = renderToString(() => <Progress label="Loading page" speed={300} />)
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-label="Loading page"')
    expect(html).toContain('data-state="idle"')
    expect(html).toContain('--sp-value:0')
    expect(html).toContain('--sp-speed:300ms')
    expect(html).toMatch(/class="sprogress-bar/)
  })

  it('controllers are inert on the server', () => {
    const p = createProgress()
    p.start()
    p.set(0.5)
    expect(p.state()).toBe('idle')
  })

  it('<RouteProgress> renders under <Router>', () => {
    const html = renderToString(() => (
      <Router
        url="/"
        root={(props) => (
          <>
            <RouteProgress />
            {props.children}
          </>
        )}
      >
        <Route path="/" component={() => <p>page</p>} />
      </Router>
    ))
    expect(html).toContain('role="progressbar"')
    expect(html).toMatch(/<p[^>]*>page<\/p>/)
  })
})
