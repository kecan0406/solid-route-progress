import type { Plugin } from 'vite'
import type { ShowcaseEntry } from './src/showcase.ts'

const dir = new URL('./showcase/', import.meta.url)
const pathOf = (url: URL) => decodeURIComponent(url.pathname)
const publicDir = new URL('./public/', import.meta.url)
const FIELDS = ['name', 'url', 'description', 'image', 'credit']
const CREDIT_FIELDS = ['text', 'url', 'license', 'licenseUrl']
/** Where a card's picture lives: a file in `public/img/showcase/`, referenced by its URL. */
const IMAGE = /^\/img\/showcase\/[\w.-]+\.(?:svg|png|webp|jpe?g|avif)$/

const isUrl = (value: unknown) => {
  try {
    return typeof value === 'string' && new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * One `showcase/<site>.json`, checked. An entry that does not fit fails the build with the file
 * and the field, so a contributor who edited it on github.com learns what to change from CI.
 */
export function parseEntry(file: string, text: string): ShowcaseEntry {
  const fail = (why: string) => new Error(`showcase/${file}: ${why}`)
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (error) {
    // the template GitHub opens carries `//` comments that JSON cannot hold
    if (/^\s*\/\//m.test(text)) throw fail('delete the // comment lines')
    throw fail(`not valid JSON (${(error as Error).message})`)
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw fail('expected one JSON object')
  }
  const entry = data as Record<string, unknown>
  for (const key of Object.keys(entry)) {
    if (!FIELDS.includes(key))
      throw fail(`unknown field "${key}" (the fields are ${FIELDS.join(', ')})`)
  }
  for (const key of ['name', 'description']) {
    const value = entry[key]
    if (typeof value !== 'string' || !value.trim())
      throw fail(`"${key}" must be a non-empty string`)
  }
  if (!isUrl(entry.url)) throw fail('"url" must be an https:// URL')
  if (entry.image !== undefined && !(typeof entry.image === 'string' && IMAGE.test(entry.image))) {
    throw fail('"image" must be a file in www/public/img/showcase/, like "/img/showcase/site.svg"')
  }
  if (entry.credit !== undefined) {
    if (entry.image === undefined) throw fail('"credit" credits the "image", so it needs one')
    const credit = entry.credit as Record<string, unknown> | null
    if (typeof credit !== 'object' || credit === null || Array.isArray(credit)) {
      throw fail('"credit" must be an object')
    }
    for (const key of Object.keys(credit)) {
      if (!CREDIT_FIELDS.includes(key)) {
        throw fail(`unknown "credit" field "${key}" (the fields are ${CREDIT_FIELDS.join(', ')})`)
      }
    }
    for (const key of ['text', 'license']) {
      const value = credit[key]
      if (typeof value !== 'string' || !value.trim()) {
        throw fail(`"credit.${key}" must be a non-empty string`)
      }
    }
    for (const key of ['url', 'licenseUrl']) {
      if (!isUrl(credit[key])) throw fail(`"credit.${key}" must be an https:// URL`)
    }
  }
  return entry as unknown as ShowcaseEntry
}

/**
 * `virtual:showcase`: the sites in `showcase/*.json`, one file per site, ordered by file name.
 * A new site is a new file, so two pull requests never touch the same lines.
 */
export function showcase(): Plugin {
  const id = 'virtual:showcase'

  return {
    name: 'showcase',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    async load(loaded) {
      if (loaded !== `\0${id}`) return
      this.addWatchFile(pathOf(dir))
      const files = (await this.fs.readdir(pathOf(dir)))
        .filter((file) => file.endsWith('.json'))
        .sort()
      const entries = await Promise.all(
        files.map(async (file) => {
          const path = pathOf(new URL(file, dir))
          this.addWatchFile(path)
          const entry = parseEntry(file, await this.fs.readFile(path, { encoding: 'utf8' }))
          if (entry.image) {
            await this.fs.stat(pathOf(new URL(`.${entry.image}`, publicDir))).catch(() => {
              throw new Error(`showcase/${file}: "image" ${entry.image} is not in www/public`)
            })
          }
          return entry
        }),
      )
      return `export default ${JSON.stringify(entries)}`
    },
  }
}
