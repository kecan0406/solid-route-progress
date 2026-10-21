import { createSignal, untrack } from 'solid-js'
import { isServer } from '@solidjs/web'
import {
  createProgressEngine,
  type ProgressController,
  type ProgressOptions,
  type Runtime,
} from './engine/progress'
import { disposalSignal } from './owner'

const solid: Runtime = {
  // The engine's cells never hold a function, which `createSignal` would take as a derivation.
  cell: createSignal as Runtime['cell'],
  // A write made inside an `action()` waits for its transition to commit. Published from a
  // microtask, the bar shows while the work it tracks is still in flight.
  publish: (fn) => queueMicrotask(fn),
  peek: untrack,
  server: isServer,
}

/**
 * Headless progress controller backed by Solid signals. Rendering is left to CSS: the
 * controller only exposes a target `value` and a `state`, which `<Progress>` mirrors to
 * `--sp-value` and `data-state`. Its accessors catch up on a microtask, outside any
 * transition, so it works the same inside an `action()`. Its timers are cleared with the
 * surrounding owner.
 */
export function createProgress(options: ProgressOptions = {}): ProgressController {
  return createProgressEngine(solid, options, disposalSignal())
}
