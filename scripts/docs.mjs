// Writes the docs into `dist/docs/` as Markdown, so an agent reading `node_modules` finds the
// docs of the installed version. Same sources as the site's `.md` pages (see `www/llms.ts`).
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import pkg from '../package.json' with { type: 'json' }
import { packageDocs, siteOf } from '../www/llms.ts'

const dir = new URL('../dist/docs/', import.meta.url)
await mkdir(dir, { recursive: true })
const files = await packageDocs(siteOf(pkg), (url) => readFile(url, 'utf8'))
for (const [file, markdown] of Object.entries(files))
  await writeFile(new URL(file, dir), `${markdown}\n`)
