import { useProgress } from 'solid-route-progress'
import { sleep } from '~/lib/albums'

export default function Home() {
  // ★ 6. Anything that is not a navigation: hold the bar with `track()` (or `start()` / release).
  const progress = useProgress()

  return (
    <>
      <h1 class="mb-3 text-3xl font-semibold tracking-tight">solid-route-progress</h1>
      <p class="mb-8 text-zinc-600 dark:text-zinc-400">
        Follow the links above. The bar shows while the next route loads, skips the instant one, and
        works for back and forward too.
      </p>
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          onClick={() => progress.track(sleep(1500))}
        >
          Track a request (1.5 s)
        </button>
        <button
          type="button"
          class="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          // A rejected promise completes the bar with `data-error`.
          onClick={() => progress.track(sleep(1000).then(() => Promise.reject())).catch(() => {})}
        >
          Fail a request
        </button>
      </div>
    </>
  )
}
