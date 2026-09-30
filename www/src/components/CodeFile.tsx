import type { JSX } from 'solid-js'
import { Highlight, type Lang } from '~/highlight'

/**
 * A code card: the file's name in a header (with an `action` beside it), then the highlighted
 * source. The landing's `CodeCard` and the showcase's entry sample share it.
 */
export function CodeFile(props: {
  file: string
  text: string
  lang: Lang
  action?: JSX.Element
  class?: string
}) {
  return (
    <div class={`overflow-hidden rounded-xl border border-border bg-muted ${props.class ?? ''}`}>
      <div class="flex items-center border-b border-border px-3.5 py-2">
        <span class="font-mono text-[11px] font-medium text-muted-foreground">{props.file}</span>
        {props.action}
      </div>
      <pre class="overflow-x-auto px-4 py-3.5 font-mono text-[12px] leading-[1.7]">
        <Highlight text={props.text} lang={props.lang} />
      </pre>
    </div>
  )
}
