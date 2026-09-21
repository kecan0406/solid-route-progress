import { createSignal, Show } from 'solid-js'
import { Bar, createProgress, Progress } from 'solid-route-progress'
import { Btn, delay, fail, Panel, Row } from './ui'

const Toggle = (props: { label: string; on: boolean; onChange: (on: boolean) => void }) => (
  <label class="flex items-center gap-1.5 text-[13px]">
    <input
      type="checkbox"
      checked={props.on}
      onChange={(event) => props.onChange(event.currentTarget.checked)}
    />
    {props.label}
  </label>
)

/** The recipes from the Styling docs, pasted into `app.css` as `.ex-glow` / `.ex-spinner`. */
export function StyleRecipes() {
  // `speed` is stretched from its 200 ms default so the done phase (and the red of a failed
  // load) lasts long enough to see.
  const progress = createProgress({ speed: 450 })
  const [glow, setGlow] = createSignal(true)
  const [spinner, setSpinner] = createSignal(true)

  return (
    <Panel>
      <Progress
        controller={progress}
        class={`ex-error absolute${glow() ? ' ex-glow' : ''}`}
        label="Styled bar"
        busyAttribute={false}
      >
        <Bar />
        <Show when={spinner()}>
          <div class="ex-spinner" aria-hidden="true" />
        </Show>
      </Progress>
      <Row>
        <Btn onClick={() => progress.track(delay(2500))}>Load</Btn>
        <Btn onClick={() => progress.track(fail(1800)).catch(() => {})}>Load and fail</Btn>
        <Toggle label="glow" on={glow()} onChange={setGlow} />
        <Toggle label="spinner" on={spinner()} onChange={setSpinner} />
      </Row>
    </Panel>
  )
}
