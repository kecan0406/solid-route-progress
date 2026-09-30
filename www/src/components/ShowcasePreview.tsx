import { For } from 'solid-js'

/** Each row of the feed: the widths (in %) of a name line, then two lines of text. */
const ROWS = [
  [34, 100, 72],
  [28, 94, 58],
  [40, 100, 80],
  [30, 90, 46],
]

const Line = (props: { width: number }) => (
  <div class="h-2 rounded-sm bg-foreground/9" style={{ width: `${props.width}%` }} />
)

/**
 * A neutral wireframe of a feed page with a bar drifting across its top edge, in the same plain
 * blocks the simulator uses. It stands in for a screenshot and is decorative; the parent sizes it.
 */
export function ShowcasePreview(props: { class?: string }) {
  return (
    <div aria-hidden="true" class={`flex bg-muted ${props.class ?? ''}`}>
      <div class="relative min-w-0 flex-1 overflow-hidden rounded-tl-[10px] border border-r-0 border-b-0 border-border bg-card px-5 pt-5">
        <div class="showcase-bar absolute inset-x-0 top-0 z-10 h-[3px] overflow-hidden" />
        <div class="mb-5 flex items-center gap-2">
          <div class="h-2.5 w-14 rounded-[5px] bg-foreground/20" />
          <div class="ml-auto h-2 w-[38px] rounded-sm bg-foreground/9" />
          <div class="h-2 w-[38px] rounded-sm bg-foreground/9" />
          <div class="h-2 w-7 rounded-sm bg-foreground/9" />
        </div>
        <For each={ROWS}>
          {(widths) => (
            <div class="mb-[18px] grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
              <div class="size-7 rounded-full bg-foreground/9" />
              <div class="grid content-start gap-[7px]">
                <For each={widths}>{(width) => <Line width={width} />}</For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
