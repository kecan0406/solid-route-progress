/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, onMount } from 'solid-js'
import { NavigationProgress } from 'solid-route-progress/navigation'

/**
 * A tiny "router" that intercepts same-document navigations with the Navigation API and
 * pretends to load for a while. The progress bar only listens to the API's events.
 */
const App = () => {
  const [path, setPath] = createSignal(location.pathname + location.hash)
  onMount(() => {
    const navigation = (window as { navigation?: any }).navigation
    if (!navigation) return
    navigation.addEventListener('navigate', (event: any) => {
      const url = new URL(event.destination.url)
      if (!event.canIntercept || event.hashChange || url.origin !== location.origin) return
      const ms = Number(url.searchParams.get('ms') ?? 0)
      event.intercept({
        async handler() {
          await new Promise((r) => setTimeout(r, ms))
          setPath(url.pathname + url.search)
        },
      })
    })
  })
  return (
    <>
      <NavigationProgress />
      <main class="mx-auto max-w-3xl space-y-4 px-6 py-8">
        <h1 class="text-xl font-semibold">Navigation API playground (no router)</h1>
        <p class="text-sm text-zinc-600">
          Intercepted navigations show the bar until their handler resolves; cross-document ones
          keep it until the page unloads. Current: <code>{path()}</code>
        </p>
        <nav class="flex flex-wrap gap-4 text-sm">
          <a class="link" href="/navigation.html?ms=0">
            instant
          </a>
          <a class="link" href="/navigation.html?ms=1500">
            1.5 s
          </a>
          <a class="link" href="/navigation.html?ms=5000">
            5 s
          </a>
          <a class="link" href="#anchor">
            hash (ignored)
          </a>
          <a class="link" href="/">
            back to router demo (cross-document)
          </a>
          <a class="link" href="https://example.com">
            external
          </a>
        </nav>
        <p id="anchor" class="text-sm text-zinc-500">
          Not supported in this browser? The bar simply stays inert.
        </p>
      </main>
    </>
  )
}

render(() => <App />, document.getElementById('root')!)
