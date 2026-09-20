import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'
import type { JSX } from 'solid-js'
import { createProgress, Progress, ProgressProvider } from '../../src'
import '../../src/style.css'

/** The JS ↔ CSS contract: `data-state` / `--sp-value` / `--sp-speed` must drive the stylesheet. */

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
/** Horizontal translation of the bar in px. */
const tx = (el: Element) => new DOMMatrix(getComputedStyle(el).transform).m41

let dispose = () => {}
afterEach(() => {
  dispose()
  document.body.innerHTML = ''
})

function mount(ui: () => JSX.Element, dir?: string) {
  const host = document.body.appendChild(document.createElement('div'))
  if (dir) host.dir = dir
  dispose = render(ui, host)
  const root = host.querySelector<HTMLElement>('.sprogress')!
  const bar = root.querySelector<HTMLElement>('.sprogress-bar')!
  // `--sp-start: 0.08` parks the bar at translateX(-92%)
  return { root, bar, parked: -0.92 * root.clientWidth }
}

describe('style.css', () => {
  it('hides the idle bar and parks it at --sp-start', () => {
    const { root, bar, parked } = mount(() => <Progress />)
    const style = getComputedStyle(root)
    expect(style.position).toBe('fixed')
    expect(style.visibility).toBe('hidden')
    expect(style.opacity).toBe('0')
    expect(style.pointerEvents).toBe('none')
    expect(tx(bar)).toBeCloseTo(parked, 0)
  })

  it('start() reveals the bar and the CSS trickle carries it forward', async () => {
    const controller = createProgress({ delay: 0 })
    const { root, bar, parked } = mount(() => <Progress controller={controller} />)
    controller.start()
    await frame()
    expect(getComputedStyle(root).visibility).toBe('visible')
    await expect.poll(() => tx(bar)).toBeGreaterThan(parked + 1)
  })

  it('done() runs the bar to the end, fades it out, then parks it', async () => {
    const controller = createProgress({ delay: 0 })
    const { root, bar, parked } = mount(() => <Progress controller={controller} />)
    controller.start()
    await frame()
    controller.done()
    await expect.poll(() => tx(bar)).toBeGreaterThan(-0.05 * root.clientWidth)
    await expect.poll(() => getComputedStyle(root).visibility).toBe('hidden')
    await expect.poll(() => tx(bar)).toBeCloseTo(parked, 0)
  })

  it('mirrors under dir="rtl"', () => {
    const { bar, parked } = mount(() => <Progress />, 'rtl')
    expect(tx(bar)).toBeCloseTo(-parked, 0)
  })

  it('the speed option reaches the CSS transitions', () => {
    const { root } = mount(() => (
      <ProgressProvider speed={600}>
        <Progress />
      </ProgressProvider>
    ))
    expect(getComputedStyle(root).transitionDuration).toBe('0.6s, 0s')
  })

  it('a stylesheet cannot put --sp-speed out of step with the JS timers', () => {
    const sheet = document.head.appendChild(document.createElement('style'))
    sheet.textContent = ':root { --sp-speed: 600ms }'
    const { root } = mount(() => <Progress />)
    expect(getComputedStyle(root).transitionDuration).toBe('0.2s, 0s')
    sheet.remove()
  })
})
