import { createAsync, useSearchParams } from '@solidjs/router'
import { Show, type JSX } from 'solid-js'
import { useProgress } from 'solid-route-progress'
import { wait } from '../data'

const Card = (props: { title: string; children: JSX.Element }) => (
  <section class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <h2 class="mb-3 text-lg font-semibold">{props.title}</h2>
    <div class="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">{props.children}</div>
  </section>
)

export const Home = () => (
  <Card title="Route progress playground">
    <p>
      Every link in the header goes through <code>@solidjs/router</code>. The bar starts when
      routing begins and completes once the route's <code>Suspense</code> resolves.
    </p>
    <p>
      Navigations shorter than <code>delay</code> (200 ms by default) are never drawn, and{' '}
      <em>Fast</em> stays hidden even at <code>delay</code> 0: it settles before the next frame. Try
      the theme picker: it only sets CSS.
    </p>
  </Card>
)

export const Fast = () => (
  <Card title="Fast">
    <p>No async work — the bar is skipped entirely.</p>
  </Card>
)

const Delayed = (props: { ms: number }) => {
  const data = createAsync(() => wait(props.ms))
  return (
    <Card title={`Slow (${props.ms} ms)`}>
      <p>{data()}</p>
    </Card>
  )
}
export const Slow = () => <Delayed ms={1500} />
export const Slower = () => <Delayed ms={5000} />

export const preloadSlow = () => void wait(1500)
export const preloadSlower = () => void wait(5000)

export const Search = () => {
  const [params, setParams] = useSearchParams()
  const data = createAsync(() => wait(params.q ? 800 : 0))
  return (
    <Card title="Search params (shallow demo)">
      <p>
        With <code>shallow</code> enabled in the header, changing only the query string keeps the
        bar hidden even though the route re-fetches.
      </p>
      <div class="flex gap-2">
        <button class="btn" onClick={() => setParams({ q: String(Date.now()) })}>
          set ?q=…
        </button>
        <button class="btn" onClick={() => setParams({ q: undefined })}>
          clear
        </button>
      </div>
      <p>q = {params.q ?? '(none)'}</p>
      <Show when={params.q}>
        <p>{data()}</p>
      </Show>
    </Card>
  )
}

export const Manual = () => {
  const progress = useProgress()
  return (
    <Card title="Manual control">
      <p>
        <code>useProgress()</code> returns the same controller the route bar uses. State:{' '}
        <b data-testid="state">{progress.state()}</b>, target value:{' '}
        <b data-testid="value">{progress.value()}</b>
      </p>
      <div class="flex flex-wrap gap-2">
        <button class="btn" onClick={() => progress.start()}>
          start()
        </button>
        <button class="btn" onClick={() => progress.set(0.3)}>
          set(0.3)
        </button>
        <button class="btn" onClick={() => progress.set(0.7)}>
          set(0.7)
        </button>
        <button class="btn" onClick={() => progress.done()}>
          done()
        </button>
      </div>
    </Card>
  )
}
