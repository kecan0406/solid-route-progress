import { createSignal, onCleanup } from 'solid-js'
import { createProgress, Progress } from 'solid-route-progress'
import { Btn, Panel, Readout, Row } from './ui'

export function DeterminateValue() {
  const progress = createProgress()
  const [sent, setSent] = createSignal(0)
  let timer: ReturnType<typeof setInterval> | undefined
  onCleanup(() => clearInterval(timer))

  const upload = () => {
    clearInterval(timer)
    setSent(0)
    timer = setInterval(() => {
      setSent(Math.min(1, sent() + 0.125))
      // `set()` reveals the bar, moves it, then hands back to the trickle; 1 completes it.
      progress.set(sent())
      if (sent() >= 1) clearInterval(timer)
    }, 320)
  }

  return (
    <Panel>
      <Progress
        controller={progress}
        class="absolute"
        label="Upload"
        getValueLabel={(percent) => `${percent} percent uploaded`}
        busyAttribute={false}
      />
      <Row>
        <Btn onClick={upload}>Upload a file</Btn>
        <Btn onClick={() => progress.done('cancel')}>Abort</Btn>
      </Row>
      <Readout>
        {Math.round(progress.value() * 100)}% · state: {progress.state()}
      </Readout>
    </Panel>
  )
}
