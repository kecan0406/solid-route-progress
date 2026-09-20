import { A } from '@solidjs/router'
import { createSignal, onMount, Show } from 'solid-js'
import { REPO } from '~/links'

const effectiveDark = () =>
  document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : !window.matchMedia('(prefers-color-scheme: light)').matches

export function Header() {
  const [dark, setDark] = createSignal(true)
  onMount(() => setDark(effectiveDark()))

  const toggle = () => {
    const next = dark() ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('sp-theme', next)
    } catch {
      /* private mode */
    }
    setDark(next === 'dark')
  }

  return (
    <header class="flex items-center gap-3.5 py-3">
      <A href="/" class="flex items-center gap-2.5">
        <span class="h-[5px] w-[26px] rounded-[3px] bg-primary" />
        <span class="text-[19px] font-semibold tracking-tight">sprogress</span>
        <span class="font-mono text-[11px] text-muted-foreground">v1.0.0</span>
      </A>
      <nav class="ml-auto flex items-center gap-1">
        <A
          href="/docs"
          class="rounded-lg px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground"
          activeClass="text-foreground"
        >
          Docs
        </A>
        <a
          href={REPO}
          class="rounded-lg px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground"
        >
          GitHub
        </a>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          class="grid size-10 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
        >
          <Show
            when={dark()}
            fallback={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            }
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
            </svg>
          </Show>
        </button>
      </nav>
    </header>
  )
}
