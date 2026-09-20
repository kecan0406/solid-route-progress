import { createSignal, Show } from 'solid-js'
import { copyText } from '~/clipboard'
import { Highlight, plain } from '~/highlight'
import { usageText } from '~/playground'

/** The code the playground produces. Every control lands in it, so one snippet is enough. */
export function CodeCard() {
  const [copied, setCopied] = createSignal(false)

  const copy = async () => {
    if (!(await copyText(plain(usageText())))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div class="mx-auto w-full max-w-[960px] overflow-hidden rounded-xl border border-border bg-muted">
      <div class="flex items-center border-b border-border px-3.5 py-2">
        <span class="font-mono text-[11px] font-medium text-muted-foreground">app.tsx</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy app.tsx"
          class="ml-auto grid size-7 place-items-center rounded-md"
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
      </div>
      <pre class="overflow-x-auto px-4 py-3.5 font-mono text-[12px] leading-[1.7]">
        <Highlight text={usageText()} lang="tsx" />
      </pre>
    </div>
  )
}
