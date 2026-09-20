import type { JSX } from 'solid-js'

/**
 * The chrome the examples share, so each example file shows its solid-route-progress code and little else.
 * `Panel` is the container recipe from the Styling docs: the bar inside it is `absolute`.
 */
export const Panel = (props: { children: JSX.Element }) => (
  <div class="relative overflow-hidden rounded-xl border border-border bg-card p-5">
    {props.children}
  </div>
)

export const Btn = (props: { onClick: () => void; children: JSX.Element }) => (
  <button
    type="button"
    onClick={() => props.onClick()}
    class="rounded-lg border border-border px-3 py-2 text-[13px] font-medium hover:bg-muted"
  >
    {props.children}
  </button>
)

/** A row of controls, and the readout under it. */
export const Row = (props: { children: JSX.Element }) => (
  <div class="flex flex-wrap items-center gap-2">{props.children}</div>
)

export const Readout = (props: { children: JSX.Element }) => (
  <p class="mt-3 font-mono text-[11.5px] text-muted-foreground">{props.children}</p>
)

/** Stands in for a request that succeeds. */
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Stands in for a request that fails. */
export const fail = (ms: number) =>
  new Promise<void>((_, reject) => setTimeout(() => reject(new Error('request failed')), ms))
