import { createSignal, For, onSettled, Show } from 'solid-js'
import { copyText } from '~/clipboard'
import { INSTALL } from '~/docs'

const KEY = 'sp-pm'
// One choice for the whole site: the hero and the Installation page show the same manager.
const [manager, setManager] = createSignal(INSTALL[0]!.manager)

/** The install command for each package manager, one click from the clipboard. */
export function InstallCommand(props: { class?: string }) {
  const [copied, setCopied] = createSignal(false)
  const command = () => INSTALL.find((install) => install.manager === manager())!.command

  onSettled(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (INSTALL.some((install) => install.manager === saved)) setManager(saved!)
    } catch {
      /* private mode */
    }
  })

  const pick = (next: string) => {
    setManager(next)
    setCopied(false)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* private mode */
    }
  }

  const copy = async () => {
    if (!(await copyText(command()))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div
      class={`inline-flex max-w-full flex-col rounded-[10px] border border-border bg-card text-left font-mono text-[13px] ${props.class ?? ''}`}
    >
      <div role="group" aria-label="Package manager" class="flex border-b border-border px-1.5">
        <For each={INSTALL}>
          {(install) => (
            <button
              type="button"
              aria-pressed={manager() === install.manager ? 'true' : 'false'}
              onClick={() => pick(install.manager)}
              class={[
                '-mb-px border-b-2 px-2 py-1.5 text-[11.5px]',
                {
                  'border-primary text-foreground': manager() === install.manager,
                  'border-transparent text-muted-foreground hover:text-foreground':
                    manager() !== install.manager,
                },
              ]}
            >
              {install.manager}
            </button>
          )}
        </For>
      </div>
      <div class="flex items-center gap-2.5 px-3.5 py-2.5">
        <span class="text-muted-foreground select-none">$</span>
        {/* from sm up as wide as the longest command, so switching managers does not resize the
            box; narrower screens scroll the command instead of widening the page */}
        <span class="min-w-0 overflow-x-auto whitespace-nowrap sm:min-w-[34ch]">{command()}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${command()}`}
          class={[
            'ml-auto',
            {
              'text-foreground': copied(),
              'text-muted-foreground hover:text-foreground': !copied(),
            },
          ]}
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
    </div>
  )
}
