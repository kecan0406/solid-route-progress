import { getOwner, onCleanup } from 'solid-js'

/**
 * An `AbortSignal` that fires when the surrounding Solid owner is disposed. Pass it to
 * `addEventListener` and the listener removes itself, or to the engine as its lifetime.
 */
export function disposalSignal(): AbortSignal {
  const controller = new AbortController()
  if (getOwner()) onCleanup(() => controller.abort())
  return controller.signal
}
