import { createSignal, Show } from 'solid-js'
import { copyText } from '~/clipboard'

export function Hero() {
  const [copied, setCopied] = createSignal(false)

  const copy = async () => {
    if (!(await copyText('npm i solid-route-progress'))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section class="mx-auto max-w-[720px] pt-6 text-center">
      <p class="mb-4 font-mono text-[11px] font-medium tracking-[0.16em] text-foreground uppercase">
        Route progress for SolidJS
      </p>
      <h1 class="mb-4.5 text-[clamp(34px,5vw,52px)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance">
        Progress, drawn in CSS.
      </h1>
      <p class="mx-auto mb-6.5 max-w-[52ch] text-[16px] text-muted-foreground">
        The loading drift is <em>one long CSS transition</em>. No JavaScript steps the bar forward,
        and any stylesheet can theme it.
      </p>
      <span class="inline-flex items-center gap-2.5 rounded-[10px] border border-border bg-card px-3.5 py-2.5 font-mono text-[13px]">
        <span class="text-muted-foreground select-none">$</span> npm i solid-route-progress
        <button
          type="button"
          onClick={copy}
          aria-label="Copy install command"
          classList={{
            'text-foreground': copied(),
            'text-muted-foreground hover:text-foreground': !copied(),
          }}
        >
          <Show
            when={copied()}
            fallback={
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
            }
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </Show>
        </button>
      </span>
    </section>
  )
}
