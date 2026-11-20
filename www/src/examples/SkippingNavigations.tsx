import { useLocation } from '@solidjs/router'
import { createMemo, Loading } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createProgress } from 'solid-route-progress'
import { RouteProgress } from 'solid-route-progress/router'
import { delay, Panel, Readout, Row } from './ui'

// These links only change the search string. A navigation shows the bar only while it waits on
// something, so the readout loads each search string the way a page loads its data. `delay: 0`
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
  const location = useLocation()
  const loaded = createMemo(async () => {
    const search = location.search
    await delay(400)
    return search || 'none'
  })

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
        <a href="?skip=go" noscroll class="rounded-lg border border-border px-3 py-2 text-[13px]">
          ?skip=go
        </a>
        <a
          href="?skip=blocked"
          noscroll
          class="rounded-lg border border-border px-3 py-2 text-[13px]"
        >
          ?skip=blocked: filtered out
        </a>
        <a
          href="?skip=quiet"
          noscroll
          data-sp-ignore
          class="rounded-lg border border-border px-3 py-2 text-[13px]"
        >
          ?skip=quiet: data-sp-ignore
        </a>
      </Row>
      <Readout>
        left: {plain.state()} · right: {shallow.state()} · loaded:{' '}
        <Loading fallback="…">{loaded()}</Loading>
      </Readout>
    </Panel>
  )
}
