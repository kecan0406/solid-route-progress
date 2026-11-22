import { siBun, siDeno, siNpm, siPnpm, siYarn } from 'simple-icons'

/**
 * Each package manager's mark, from Simple Icons, and the color it takes while its tab is picked.
 * Bun's and Deno's marks are black, so they follow the text color instead. The colors live in
 * `app.css`, which tunes them for contrast in both schemes.
 */
export const BRANDS: Record<string, { path: string; color: string }> = {
  npm: { path: siNpm.path, color: 'var(--brand-npm)' },
  pnpm: { path: siPnpm.path, color: 'var(--brand-pnpm)' },
  yarn: { path: siYarn.path, color: 'var(--brand-yarn)' },
  bun: { path: siBun.path, color: 'currentColor' },
  deno: { path: siDeno.path, color: 'currentColor' },
}
