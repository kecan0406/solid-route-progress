import { Show } from 'solid-js'
import { Bar, createProgress, Progress, useProgress } from 'solid-route-progress'
import { Btn, delay, Panel, Row } from './ui'

/**
 * Children of `<Progress>` read its controller with `useProgress()`. `value()` is the target,
 * which is `trickleTo` while trickling, so the number only shows once it is known.
 */
const Percent = () => {
  const progress = useProgress()
  return (
    <Show when={progress.state() !== 'trickle'}>
      <output class="absolute top-3 right-3 font-mono text-[11px] text-muted-foreground">
        {Math.round(progress.value() * 100)}%
      </output>
    </Show>
  )
}

export function CustomTemplate() {
  const progress = createProgress()

  return (
    <Panel>
      <Progress
        controller={progress}
        class="absolute"
        label="Custom template"
        busyAttribute={false}
      >
        <Bar class="rounded-r-full" />
        <Percent />
      </Progress>
      <Row>
        <Btn onClick={() => progress.track(delay(2500))}>Load something slow</Btn>
      </Row>
    </Panel>
  )
}
