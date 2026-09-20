import { Bar, createProgress, Progress, useProgress } from 'sprogress'
import { Btn, delay, Panel, Row } from './ui'

/** Children of `<Progress>` read its controller with `useProgress()`. */
const Percent = () => {
  const progress = useProgress()
  return (
    <output class="absolute top-3 right-3 font-mono text-[11px] text-muted-foreground">
      {Math.round(progress.value() * 100)}%
    </output>
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
