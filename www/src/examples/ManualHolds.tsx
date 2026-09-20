import { createSignal } from 'solid-js'
import { createProgress, Progress, type Release } from 'solid-route-progress'
import { Btn, Panel, Readout, Row } from './ui'

export function ManualHolds() {
  // `speed` is stretched from its 200ms default so the done phase (and the red of a failed
  // load) lasts long enough to see.
  const progress = createProgress({ speed: 450 })
  const [holds, setHolds] = createSignal<Release[]>([])

  const take = () => setHolds([...holds(), progress.start()])
  const letGo = (outcome?: 'error' | 'cancel') => {
    const [first, ...rest] = holds()
    if (!first) return
    first(outcome)
    setHolds(rest)
  }

  return (
    <Panel>
      <Progress
        controller={progress}
        class="ex-error absolute"
        label="Manual holds"
        busyAttribute={false}
      />
      <Row>
        <Btn onClick={take}>Take a hold</Btn>
        <Btn onClick={() => letGo()}>Release one</Btn>
        <Btn onClick={() => letGo('cancel')}>Release as cancel</Btn>
        <Btn onClick={() => letGo('error')}>Release as error</Btn>
      </Row>
      <Readout>
        {holds().length} hold(s) · state: {progress.state()}
        {progress.error() ? ' · error' : ''}
      </Readout>
    </Panel>
  )
}
