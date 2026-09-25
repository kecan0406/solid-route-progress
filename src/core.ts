import { batch, createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'
import {
  createProgressEngine,
  type ProgressController,
  type ProgressOptions,
  type Runtime,
} from './engine/progress'
import { disposalSignal } from './owner'

const solid: Runtime = { cell: createSignal, batch, server: isServer }

/**
 * Headless progress controller backed by Solid signals. Rendering is left to CSS: the
 * controller only exposes a target `value` and a `state`, which `<Progress>` mirrors to
 * `--sp-value` and `data-state`. Its timers are cleared with the surrounding owner.
 */
export function createProgress(options: ProgressOptions = {}): ProgressController {
  return createProgressEngine(solid, options, disposalSignal())
}
