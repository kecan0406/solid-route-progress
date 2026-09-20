import { createSignal, splitProps, type JSX } from 'solid-js'

/** Shiki's `<pre>` with a copy button. */
export function CodeBlock(props: JSX.HTMLAttributes<HTMLPreElement>) {
  const [local, rest] = splitProps(props, ['children'])
  const [copied, setCopied] = createSignal(false)
  let pre!: HTMLPreElement

  const copy = () => {
    try {
      void navigator.clipboard.writeText(pre.textContent ?? '')
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div class="group relative">
      <pre ref={pre} {...rest}>
        {local.children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        class="absolute top-2.5 right-2.5 rounded-md border border-border bg-muted px-2 py-1 font-mono text-[10.5px] font-medium opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        classList={{
          'text-foreground': copied(),
          'text-muted-foreground hover:text-foreground': !copied(),
        }}
      >
        {copied() ? 'copied' : 'copy'}
      </button>
    </div>
  )
}
