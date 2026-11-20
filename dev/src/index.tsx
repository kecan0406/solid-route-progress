/* @refresh reload */
import { render } from '@solidjs/web'
import { createRouter, type RouteSectionProps } from '@solidjs/router'
import { createSignal, For, Loading, Show } from 'solid-js'
import { Bar, ProgressProvider } from 'solid-route-progress'
import { RouteProgress } from 'solid-route-progress/router'
import {
  Fast,
  Home,
  Manual,
  preloadSlow,
  preloadSlower,
  Search,
  Slow,
  Slower,
} from './routes/pages'

const themes = ['default', 'glow', 'rose', 'mono', 'gradient', 'slow'] as const

const [theme, setTheme] = createSignal<(typeof themes)[number]>('default')
const [shallow, setShallow] = createSignal(false)
const [spinner, setSpinner] = createSignal(false)
const [delay, setDelay] = createSignal(200)

const Layout = (props: RouteSectionProps) => (
  <ProgressProvider delay={delay()}>
    <RouteProgress shallow={shallow()}>
      <Bar />
      <Show when={spinner()}>
        <div class="spinner" aria-hidden="true" />
      </Show>
    </RouteProgress>
    <header class="sticky top-0 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav class="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 text-sm">
        <a href="/" class="link">
          Home
        </a>
        <a href="/fast" class="link">
          Fast
        </a>
        <a href="/slow" class="link">
          Slow
        </a>
        <a href="/slower" class="link">
          Slower
        </a>
        <a href="/search" class="link">
          Search
        </a>
        <a href="/manual" class="link">
          Manual
        </a>
        <a href="https://example.com" class="link">
          External ↗
        </a>
        <a href="https://example.com" class="link" data-sp-ignore>
          External (ignored)
        </a>
        <a href="/navigation.html" class="link">
          Navigation API demo
        </a>
        <span class="grow" />
        <label class="flex items-center gap-1">
          theme
          <select
            name="theme"
            class="rounded border border-zinc-300 bg-transparent px-1 py-0.5 dark:border-zinc-700"
            value={theme()}
            onChange={(e) => {
              setTheme(e.currentTarget.value as (typeof themes)[number])
              document.documentElement.dataset.theme = e.currentTarget.value
            }}
          >
            <For each={themes}>{(t) => <option value={t}>{t}</option>}</For>
          </select>
        </label>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            name="shallow"
            checked={shallow()}
            onChange={(e) => setShallow(e.currentTarget.checked)}
          />
          shallow
        </label>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            name="spinner"
            checked={spinner()}
            onChange={(e) => setSpinner(e.currentTarget.checked)}
          />
          spinner
        </label>
        <label class="flex items-center gap-1">
          delay
          <input
            type="number"
            name="delay"
            class="w-16 rounded border border-zinc-300 bg-transparent px-1 py-0.5 dark:border-zinc-700"
            value={delay()}
            step={50}
            min={0}
            onChange={(e) => setDelay(Number(e.currentTarget.value))}
          />
        </label>
      </nav>
    </header>
    <main class="mx-auto max-w-3xl px-6 py-8 transition-opacity [[data-sp-busy]_&]:opacity-60">
      <Loading fallback={<p class="text-sm text-zinc-500">loading…</p>}>{props.children}</Loading>
    </main>
  </ProgressProvider>
)

const Router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/fast', component: Fast },
    { path: '/slow', component: Slow, preload: preloadSlow },
    { path: '/slower', component: Slower, preload: preloadSlower },
    { path: '/search', component: Search },
    { path: '/manual', component: Manual },
  ],
})

render(() => <Router>{Layout}</Router>, document.getElementById('root')!)
