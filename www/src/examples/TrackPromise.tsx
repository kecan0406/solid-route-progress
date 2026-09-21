import { createProgress, Progress } from 'solid-route-progress'
import { Btn, delay, fail, Panel, Readout, Row } from './ui'

export function TrackPromise() {
  // `speed` is stretched from its 200 ms default so the done phase (and the red of a failed
  // load) lasts long enough to see.
  const progress = createProgress({ speed: 450 })

  return (
    <Panel>
      <Progress
        controller={progress}
        class="ex-error absolute"
        label="Tracked request"
        busyAttribute={false}
      />
      <Row>
        <Btn onClick={() => progress.track(delay(1500))}>Fetch (1.5 s)</Btn>
        <Btn onClick={() => progress.track(fail(1200)).catch(() => {})}>Fail it (1.2 s)</Btn>
        <Btn onClick={() => progress.track(delay(120))}>Too fast to show (120 ms)</Btn>
      </Row>
      <Readout>
        state: {progress.state()}
        {progress.error() ? ' · error' : ''}
      </Readout>
    </Panel>
  )
}
