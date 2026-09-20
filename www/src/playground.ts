import { createSignal, type JSX } from 'solid-js'
import { createStore } from 'solid-js/store'
import { live } from '~/highlight'

/**
 * Named so a swatch reads as "blue" to assistive tech, not as a wall of `oklch()`.
 *
 * `neutral` is the theme's own colour, so the bar flips with the colour scheme. The three hues
 * are hackerspub's status colours, which it declares once for both schemes.
 */
export const SWATCHES = [
  { name: 'neutral', color: 'var(--primary)' },
  { name: 'blue', color: 'oklch(0.68 0.148143 238.1044)' },
  { name: 'green', color: 'oklch(0.69 0.1481 162.37)' },
  { name: 'amber', color: 'oklch(0.71 0.186 48.13)' },
]

export const DEFAULTS = {
  color: SWATCHES[0]!.color,
  height: 3,
  speed: 200,
  trickle: 10,
}

export const [cfg, setCfg] = createStore({ ...DEFAULTS })

/** `true` while the simulator has a navigation in flight. */
export const [navLoading, setNavLoading] = createSignal(false)

/** Custom properties for a `<Progress>` element, straight from the playground config. */
export function barVars(): JSX.CSSProperties {
  return {
    '--sp-color': cfg.color,
    '--sp-height': `${cfg.height}px`,
    '--sp-trickle-duration': `${cfg.trickle}s`,
  }
}

/** The custom properties that differ from where the playground started. */
function overrides(): [string, string][] {
  const lines: [string, string][] = []
  if (cfg.color !== DEFAULTS.color) lines.push(['--sp-color', cfg.color])
  if (cfg.height !== DEFAULTS.height) lines.push(['--sp-height', `${cfg.height}px`])
  if (cfg.trickle !== DEFAULTS.trickle) lines.push(['--sp-trickle-duration', `${cfg.trickle}s`])
  return lines
}

/**
 * The router setup, with whatever the playground changed marked `live()`. The custom properties
 * ride inline on the element — one of the places the Styling docs say to set them, and what this
 * site does itself — so a single snippet covers every control.
 */
export function usageText(): string {
  const speed = cfg.speed !== DEFAULTS.speed ? ` speed={${live(cfg.speed)}}` : ''
  const vars = overrides()
  const bar = vars.length
    ? [
        '<RouteProgress',
        '        style={{',
        ...vars.map(([property, value]) => `          '${property}': '${live(value)}',`),
        '        }}',
        '      />',
      ].join('\n')
    : '<RouteProgress />'
  return `import { Router } from '@solidjs/router'
import { Suspense } from 'solid-js'
import { ProgressProvider } from 'sprogress'
import { RouteProgress } from 'sprogress/router'
import 'sprogress/style.css'

<Router
  root={(props) => (
    <ProgressProvider${speed}>
      ${bar}
      <Suspense>{props.children}</Suspense>
    </ProgressProvider>
  )}
>
  {/* routes */}
</Router>`
}
