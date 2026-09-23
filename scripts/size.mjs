// Reports minified + gzip/brotli sizes of every public entry and fails when a budget is exceeded.
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { brotliCompressSync, gzipSync } from 'node:zlib'

/** gzip budgets in bytes (`null` = report only) */
const BUDGET = {
  'index.js': 300,
  'router.js': 700,
  'navigation.js': 550,
  'shared.js': 2300,
  'style.css': 650,
  'createProgress-only.js': 1000,
}
const JS_TOTAL_BUDGET = 3600

const root = new URL('../', import.meta.url).pathname
const out = join(root, '.size')
const exportsOut = join(root, '.size-exports')
const clean = () => {
  rmSync(out, { recursive: true, force: true })
  rmSync(exportsOut, { recursive: true, force: true })
}
clean()
execSync('pnpm exec tsdown -c tsdown.size.config.ts', { cwd: root, stdio: 'ignore' })

// Ship readable CSS; measure it the way a consumer's bundler will emit it.
const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim()

const jsIn = (dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => [f, readFileSync(join(dir, f))])
const files = [
  ...jsIn(out),
  ...jsIn(exportsOut),
  ['style.css', Buffer.from(minifyCss(readFileSync(join(root, 'src/style.css'), 'utf8')))],
]

let jsTotal = 0
let failed = false
const rows = files.map(([file, buf]) => {
  const gzip = gzipSync(buf, { level: 9 }).length
  const brotli = brotliCompressSync(buf).length
  const budget = BUDGET[file] ?? null
  const ok = budget == null || gzip <= budget
  if (!ok) failed = true
  // single-import probes overlap the entries, so they stay out of the total
  if (file.endsWith('.js') && !file.endsWith('-only.js')) jsTotal += gzip
  return { file, min: buf.length, gzip, brotli, budget: budget ?? '-', ok: ok ? '✓' : '✗' }
})
console.table(rows)
console.log(`JS total (min+gzip): ${jsTotal} B / budget ${JS_TOTAL_BUDGET} B`)
clean()
if (jsTotal > JS_TOTAL_BUDGET) failed = true
if (failed) {
  console.error('size budget exceeded')
  process.exit(1)
}
