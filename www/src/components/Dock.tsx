import { For, onCleanup, Show } from 'solid-js'
import type { ProgressController } from 'solid-route-progress'
import { cfg, DEFAULTS, navLoading, setCfg, SWATCHES } from '~/playground'

const Label = (props: { name: string; value?: string; for?: string }) => (
  <label
    for={props.for}
    class="mb-2.5 block font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
  >
    {props.name}
    <Show when={props.value}>
      <span class="float-right tracking-normal text-foreground normal-case">{props.value}</span>
    </Show>
  </label>
)

export function Dock(props: { winCtl: ProgressController }) {
  let pulseTimer: ReturnType<typeof setTimeout> | undefined
  let releasePulse: (() => void) | undefined
  onCleanup(() => {
    clearTimeout(pulseTimer)
    releasePulse?.()
  })

  /** Apply a config change and preview it on the demo's bar. */
  const tune = (patch: Partial<typeof DEFAULTS>) => {
    setCfg(patch)
    if (navLoading()) return
    const previous = releasePulse
    releasePulse = props.winCtl.start()
    previous?.()
    clearTimeout(pulseTimer)
    // a hold of its own: letting go never ends a simulated navigation started meanwhile
    pulseTimer = setTimeout(() => {
      releasePulse?.()
      releasePulse = undefined
    }, 1500)
  }

  return (
    <section
      aria-label="Playground settings"
      class="mx-auto grid w-full max-w-[960px] grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-7 gap-y-5 border-t border-border pt-6"
    >
      <div>
        <Label name="--sp-color" />
        <div class="flex gap-2">
          <For each={SWATCHES}>
            {(swatch) => (
              <button
                type="button"
                aria-label={`Bar color ${swatch.name}`}
                aria-pressed={cfg.color === swatch.color}
                onClick={() => tune({ color: swatch.color })}
                style={{ background: swatch.color }}
                class="size-5.5 rounded-full border-2 border-transparent aria-pressed:border-foreground aria-pressed:shadow-[0_0_0_2px_var(--background),inset_0_0_0_2px_var(--background)]"
              />
            )}
          </For>
        </div>
      </div>
      <div>
        <Label name="--sp-height" value={`${cfg.height}px`} for="sp-height" />
        <input
          id="sp-height"
          type="range"
          min="2"
          max="8"
          step="1"
          value={cfg.height}
          onInput={(e) => tune({ height: +e.currentTarget.value })}
          class="w-full"
        />
      </div>
      <div>
        <Label name="speed" value={`${cfg.speed}ms`} for="sp-speed" />
        <input
          id="sp-speed"
          type="range"
          min="80"
          max="600"
          step="20"
          value={cfg.speed}
          onInput={(e) => tune({ speed: +e.currentTarget.value })}
          class="w-full"
        />
      </div>
      <div>
        <Label name="--sp-trickle-duration" value={`${cfg.trickle}s`} for="sp-trickle" />
        <input
          id="sp-trickle"
          type="range"
          min="4"
          max="20"
          step="1"
          value={cfg.trickle}
          onInput={(e) => tune({ trickle: +e.currentTarget.value })}
          class="w-full"
        />
      </div>
    </section>
  )
}
