// Lines marked ★ are the solid-route-progress setup; the rest is an ordinary SolidStart app.
import { A, Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { For, Suspense } from 'solid-js'
import { ProgressProvider } from 'solid-route-progress'
import { RouteProgress } from 'solid-route-progress/router'
import './app.css'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/albums', label: 'Albums (0.8 s)' },
  { href: '/about', label: 'About (instant)' },
]

export default function App() {
  return (
    <Router
      root={(props) => (
        // ★ 3. One provider shares the controller: route changes and `useProgress()` both drive it.
        <ProgressProvider>
          {/* ★ 4. The bar. Anywhere under <Router>; failed loads turn it red via `data-error:`. */}
          <RouteProgress class="data-error:[--sp-color:var(--color-bar-error)]" />
          <div class="mx-auto max-w-2xl px-6 py-10">
            <nav class="mb-10 flex gap-5 text-sm">
              <For each={LINKS}>
                {(link) => (
                  <A
                    href={link.href}
                    end
                    class="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    activeClass="font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    {link.label}
                  </A>
                )}
              </For>
            </nav>
            {/* ★ 5. `data-sp-busy` sits on <html> while the bar shows: dim the page meanwhile. */}
            <main class="transition-opacity [[data-sp-busy]_&]:opacity-50">
              <Suspense>{props.children}</Suspense>
            </main>
          </div>
        </ProgressProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
