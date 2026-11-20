import { createRouter, intentPreload } from '@solidjs/router'
import { fileRoutes } from '@solidjs/router/fs'
import { Loading } from 'solid-js'
import { ProgressProvider } from 'solid-route-progress'
import { RouteProgress } from 'solid-route-progress/router'
import { pageRoutes } from 'virtual:file-routes'
import { barVars, cfg } from '~/playground'
import './app.css'

const Router = createRouter({ routes: fileRoutes(pageRoutes), preloadLinks: intentPreload() })

export default function App() {
  return (
    <Router>
      {(props) => (
        // The site's own bar: route changes, external links and the playground all drive it.
        <ProgressProvider speed={cfg.speed}>
          <RouteProgress style={barVars()} />
          <Loading>{props.children}</Loading>
        </ProgressProvider>
      )}
    </Router>
  )
}
