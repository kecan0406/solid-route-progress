/**
 * Development-only diagnostics. `isDev` follows solid-js's `development` export condition, so
 * a production build resolves it to `false` and drops every branch it guards.
 */
export { isDev as DEV } from 'solid-js/web'

export const warn = (message: string): void => console.warn(`[sprogress] ${message}`)
