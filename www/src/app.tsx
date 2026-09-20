// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { ProgressProvider } from 'sprogress'
import { RouteProgress } from 'sprogress/router'
import { barVars, cfg } from '~/playground'
import './app.css'

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Progress, drawn in CSS · sprogress</Title>
          {/* The site's own bar: route changes, external links and the playground all drive it. */}
          <ProgressProvider speed={cfg.speed}>
            <RouteProgress style={barVars()} />
            <Suspense>{props.children}</Suspense>
          </ProgressProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
