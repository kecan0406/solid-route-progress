import { createSignal, For, onCleanup, type JSX } from 'solid-js'
import { Progress, type Outcome, type ProgressController } from 'solid-route-progress'
import { barVars, navLoading, setNavLoading } from '~/playground'

type Route = '/' | '/new' | '/album/117' | '/checkout'

/** A cover, a thumbnail, a placeholder — every block in the demo is the same neutral surface. */
const Block = (props: { class: string }) => <div class={`rounded-lg bg-muted ${props.class}`} />

const Head = (props: { title: string; sub: string }) => (
  <>
    <h3 class="mb-1 text-[21px] font-semibold tracking-tight">{props.title}</h3>
    <p class="mb-4 text-[13px] text-muted-foreground">{props.sub}</p>
  </>
)

const ListView = (props: { title: string; sub: string; rows: [string, string, string][] }) => (
  <>
    <Head title={props.title} sub={props.sub} />
    <div class="flex flex-col">
      <For each={props.rows}>
        {([title, artist, price]) => (
          <div class="flex items-center gap-3 border-b border-border py-2.5 text-[13px] last:border-b-0">
            <Block class="size-9 flex-none" />
            <div class="min-w-0 flex-1">
              <b class="font-medium">{title}</b>
              <span class="block text-[11.5px] text-muted-foreground">{artist}</span>
            </div>
            <span class="font-mono text-xs">{price}</span>
          </div>
        )}
      </For>
    </div>
  </>
)

const DetailView = (props: { title: string; sub: string; body: string; action: string }) => (
  <div class="flex items-start gap-5">
    <Block class="aspect-square w-[132px] flex-none" />
    <div class="min-w-0">
      <Head title={props.title} sub={props.sub} />
      <p class="mb-4 max-w-[38ch] text-[13px] leading-relaxed">{props.body}</p>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground hover:brightness-110"
      >
        {props.action}
      </button>
    </div>
  </div>
)

/** Four routes, two views: the latency is what differs, so the chrome around it stays the same. */
const ROUTES: { path: Route; label: string; lat: number; view: () => JSX.Element }[] = [
  {
    path: '/',
    label: 'Home',
    lat: 300,
    view: () => (
      <ListView
        title="Fresh pressings, weekly."
        sub="Hand-picked vinyl from labels that still master for the groove."
        rows={[
          ['Longest Transition', 'The Easings · LP', '$28'],
          ['Zero Timers', 'Idle State · EP', '$18'],
          ['Trickle Down', '95 Percent · LP', '$24'],
        ]}
      />
    ),
  },
  {
    path: '/new',
    label: 'New arrivals',
    lat: 900,
    view: () => (
      <ListView
        title="New arrivals"
        sub="Four records landed this morning."
        rows={[
          ['Fade In / Fade Out', 'Visibility Hidden', '$24'],
          ['Cubic Bézier Blues', 'The Curves', '$21'],
          ['Repaint', 'Compositor Only', '$26'],
          ['Route Change', 'Soft Navigations', '$19'],
        ]}
      />
    ),
  },
  {
    path: '/album/117',
    label: 'LP·117',
    lat: 1500,
    view: () => (
      <DetailView
        title="LP·117: Cubic Bézier Blues"
        sub={'The Curves · 2026 · 12" 180g · gatefold sleeve'}
        body="Eight tracks that start fast out of the gate, then settle into a long, patient crawl. Never quite arrives, on purpose."
        action="Add to crate · $21"
      />
    ),
  },
  {
    path: '/checkout',
    label: 'Checkout',
    lat: 2600,
    view: () => (
      <DetailView
        title="Checkout"
        sub="This route's API is slow on purpose, so watch the crawl."
        body="Ada Groove · 95 Trickle Ave, Almost There. Ships Tuesday, arrives whenever the transition says so."
        action="Pay $21"
      />
    ),
  },
]
const byPath = (path: Route) => ROUTES.find((route) => route.path === path)!

export function Simulator(props: { pageCtl: ProgressController; winCtl: ProgressController }) {
  const [committed, setCommitted] = createSignal<Route>('/album/117')
  const [target, setTarget] = createSignal<Route>('/album/117')
  let navTimer: ReturnType<typeof setTimeout> | undefined
  /** Releases the holds of the simulated navigation in flight. */
  let release: ((outcome?: Outcome) => void) | undefined
  onCleanup(() => {
    clearTimeout(navTimer)
    release?.('cancel')
  })

  const navigate = (route: Route) => {
    if (target() === route) return
    clearTimeout(navTimer)
    setNavLoading(true)
    setTarget(route)
    // real controllers: the demo's bar and the site's own bar move together
    const releaseWin = props.winCtl.start()
    const releasePage = props.pageCtl.start()
    // hold the new load before letting go of the one it replaces, so the bars keep going
    release?.()
    release = (outcome) => {
      releaseWin(outcome)
      releasePage(outcome)
    }
    navTimer = setTimeout(() => {
      setCommitted(route)
      setNavLoading(false)
      release?.()
      release = undefined
    }, byPath(route).lat)
  }

  return (
    <section
      aria-label="Navigation demo"
      class="relative mx-auto flex h-[400px] w-full max-w-[960px] flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <Progress
        controller={props.winCtl}
        style={barVars()}
        class="absolute"
        label="Simulated page loading"
        busyAttribute={false}
      />
      <nav
        aria-label="Demo routes"
        class="flex items-center gap-0.5 overflow-x-auto border-b border-border px-3 py-2.5"
      >
        <For each={ROUTES}>
          {(route) => (
            <button
              type="button"
              onClick={() => navigate(route.path)}
              aria-current={committed() === route.path ? 'page' : undefined}
              class="flex-none rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current]:bg-muted aria-[current]:text-foreground"
            >
              {route.label}{' '}
              <span class="font-mono text-[10px] opacity-75">{route.lat / 1000}s</span>
            </button>
          )}
        </For>
        <span class="ml-auto hidden flex-none pl-4 font-mono text-[11px] text-muted-foreground sm:block">
          trickle.records{target()}
        </span>
      </nav>
      <div
        class="min-h-0 flex-1 overflow-auto px-7 py-6 transition-opacity duration-300"
        classList={{ 'opacity-60': navLoading() }}
      >
        {byPath(committed()).view()}
      </div>
    </section>
  )
}
