import { A } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { createProgress } from 'solid-route-progress'
import { RouteProgress } from 'solid-route-progress/router'
import { Panel, Readout, Row } from './ui'

// These links only change the search string, so every navigation here is instant. `delay: 0`
// and a long `stopDelay` make the flash visible; what matters is which bar flashes at all.
const options = { delay: 0, stopDelay: 700 }

const Slot = (props: { name: string; children: JSX.Element }) => (
  <div class="relative overflow-hidden rounded-lg border border-border py-3 text-center">
    {props.children}
    <span class="font-mono text-[11px] text-muted-foreground">{props.name}</span>
  </div>
)

export function SkippingNavigations() {
  const plain = createProgress(options)
  const shallow = createProgress(options)

  return (
    <Panel>
      <div class="mb-4 grid gap-3 sm:grid-cols-2">
        <Slot name="default + filter">
          <RouteProgress
            controller={plain}
            class="absolute"
            label="Default bar"
            busyAttribute={false}
            crossDocument={false}
            filter={(to) => !to.includes('skip=blocked')}
          />
        </Slot>
        <Slot name="shallow">
          <RouteProgress
            controller={shallow}
            class="absolute"
            label="Shallow bar"
            busyAttribute={false}
            crossDocument={false}
            shallow
          />
        </Slot>
      </div>
      <Row>
        <A href="?skip=go" noScroll class="rounded-lg border border-border px-3 py-2 text-[13px]">
          ?skip=go
        </A>
        <A
          href="?skip=blocked"
          noScroll
          class="rounded-lg border border-border px-3 py-2 text-[13px]"
        >
          ?skip=blocked: filtered out
        </A>
        <A
          href="?skip=quiet"
          noScroll
          data-sp-ignore
          class="rounded-lg border border-border px-3 py-2 text-[13px]"
        >
          ?skip=quiet: data-sp-ignore
        </A>
      </Row>
      <Readout>
        left: {plain.state()} · right: {shallow.state()}
      </Readout>
    </Panel>
  )
}
