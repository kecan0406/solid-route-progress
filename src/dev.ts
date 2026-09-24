/**
 * Development-only diagnostics. `isDev` follows solid-js's `development` export condition, so
 * a production build resolves it to `false` and drops every branch it guards.
 */
export { isDev as DEV } from 'solid-js/web'

/** A message that ends with the docs section explaining the fix, e.g. `installation#stylesheet`. */
export const explain = (message: string, docs: string): string =>
  `[sprogress] ${message} See https://solid-route-progress.vercel.app/docs/${docs}`

export const warn = (message: string, docs: string): void => console.warn(explain(message, docs))
