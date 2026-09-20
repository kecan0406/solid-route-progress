import { query } from '@solidjs/router'

export const wait = query(async (ms: number) => {
  await new Promise((r) => setTimeout(r, ms))
  return `resolved after ${ms} ms at ${new Date().toLocaleTimeString()}`
}, 'wait')
