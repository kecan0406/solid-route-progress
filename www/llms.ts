import type { Plugin } from 'vite'
import { DOCS, DOC_PAGES, INSTALL, markdownPath } from './src/docs.ts'

export interface Site {
  origin: string
  name: string
  description: string
  repo: string
  peers: Record<string, string>
}

/** The site's facts, all read from the package's own `package.json`. */
export function siteOf(pkg: {
  name: string
  description: string
  homepage: string
  repository: { url: string }
  peerDependencies: Record<string, string>
}): Site {
  return {
    origin: pkg.homepage,
    name: pkg.name,
    description: pkg.description,
    repo: pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
    peers: pkg.peerDependencies,
  }
}

export type Read = (url: URL) => Promise<string>

const docsDir = new URL('./src/routes/docs/', import.meta.url)

/**
 * `virtual:llms`: the docs as Markdown for agents, after https://llmstxt.org — `/llms.txt` (the
 * index), `/llms-full.txt` (every page in one file), and a `.md` copy of each page. Built from the
 * same `.mdx` sources as the HTML pages; `src/middleware.ts` serves them.
 */
export function llms(site: Site): Plugin {
  const id = 'virtual:llms'

  return {
    name: 'llms',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    async load(loaded) {
      if (loaded !== `\0${id}`) return
      const read: Read = (url) => {
        const path = decodeURIComponent(url.pathname)
        this.addWatchFile(path)
        return this.fs.readFile(path, { encoding: 'utf8' })
      }
      const link = (href: string) => `${site.origin}${markdownPath(href)}`
      const pages = await docPages(read, link)

      const files: Record<string, string> = {}
      for (const page of pages) files[markdownPath(page.href)] = page.markdown
      files['/llms.txt'] = index(site, link, [
        `Every link below is a Markdown copy of a docs page; drop the \`.md\` for the HTML page.`,
        `- [All docs in one file](${site.origin}/llms-full.txt): every page above, concatenated`,
      ])
      files['/llms-full.txt'] = pages
        .map((page) =>
          page.markdown.replace(/^# .*/, (h1) => `${h1}\n\nSource: ${site.origin}${page.href}`),
        )
        .join('\n\n---\n\n')

      return `export default ${JSON.stringify(files)}`
    },
  }
}

/** A docs page's file name inside the package: `/docs` → `introduction.md`, `/docs/styling` → `styling.md`. */
const packageFile = (href: string) =>
  `${href === '/docs' ? 'introduction' : href.slice('/docs/'.length)}.md`

/**
 * The same docs for the npm package (`dist/docs/`), so an agent reading `node_modules` finds
 * the docs of the installed version: one file per page, linked to each other, and a `README.md`
 * index.
 */
export async function packageDocs(site: Site, read: Read): Promise<Record<string, string>> {
  const link = (href: string) => `./${packageFile(href)}`
  const pages = await docPages(read, link)
  const files: Record<string, string> = {}
  for (const page of pages) files[packageFile(page.href)] = page.markdown
  files['README.md'] = index(site, link, [
    `These are the docs of the installed version; the site has the latest: ${site.origin}/docs`,
  ])
  return files
}

async function docPages(read: Read, link: (href: string) => string) {
  return Promise.all(
    DOC_PAGES.map(async (page) => ({
      ...page,
      markdown: await pageMarkdown(new URL(`${page.file}.mdx`, docsDir), read, link),
    })),
  )
}

/** The llms.txt index: title, summary, setup facts, the pages by group, then the optional extras. */
function index(site: Site, link: (href: string) => string, [note, ...optional]: string[]) {
  return [
    `# ${site.name}`,
    `> ${site.description}`,
    [
      `Install with \`${INSTALL[0]!.command}\` and import \`${site.name}/style.css\` once.`,
      `Peer dependencies: ${Object.entries(site.peers)
        .map(([name, range]) => `\`${name}\` ${range}`)
        .join(', ')} (the router one only for \`${site.name}/router\`).`,
      note,
    ].join('\n'),
    ...DOCS.map(({ group, pages }) =>
      [
        `## ${group}`,
        ...pages.map((page) => `- [${page.title}](${link(page.href)}): ${page.description}`),
      ].join('\n'),
    ),
    [
      '## Optional',
      ...optional,
      `- [Agent skill](${site.repo}/tree/main/skills/${site.name}): \`npx skills add ${site.repo.replace('https://github.com/', '')}\``,
      `- [Changelog](${site.repo}/blob/main/CHANGELOG.md): release notes`,
      `- [Source](${site.repo}): the repository`,
    ].join('\n'),
  ].join('\n\n')
}

/**
 * One `.mdx` page as plain Markdown: imports go, every JSX block becomes the code block it shows,
 * and docs links go through `link`. A JSX block with no Markdown form fails the build.
 */
async function pageMarkdown(file: URL, read: Read, link: (href: string) => string) {
  const raw = new Map<string, URL>()
  const lines = (await read(file)).split('\n')
  const out: (string | Promise<string>)[] = []
  let fenced = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.startsWith('```')) fenced = !fenced
    if (!fenced && line.startsWith('import ')) {
      const [, name, path] = /^import (\w+) from '(.+)\?raw'/.exec(line) ?? []
      if (name && path) raw.set(name, new URL(path, file))
      continue
    }
    const tag = fenced ? undefined : /^<([A-Z]\w*)/.exec(line)?.[1]
    if (!tag) {
      out.push(line)
      continue
    }
    let block = line
    if (!line.trimEnd().endsWith('/>')) {
      while (lines[i] !== `</${tag}>`) {
        if (++i === lines.length) throw new Error(`llms: <${tag}> is never closed in ${file}`)
        block += `\n${lines[i]}`
      }
    }
    out.push(jsxMarkdown(tag, block, raw, read, file))
  }

  return (await Promise.all(out))
    .join('\n')
    .replace(/\]\((\/docs[^)#\s]*)(#[^)\s]*)?\)/g, (_, path: string, hash = '') => {
      return `](${link(path)}${hash})`
    })
    .trim()
}

function jsxMarkdown(tag: string, block: string, raw: Map<string, URL>, read: Read, file: URL) {
  if (tag === 'InstallCommand') {
    return ['```sh', INSTALL.map((install) => install.command).join('\n# or\n'), '```'].join('\n')
  }
  // `<Example source={x}>` and `<Highlight text={x} lang="css" />` show a file imported with `?raw`
  const name = /(?:source|text)=\{(\w+)\}/.exec(block)?.[1]
  const path = name && raw.get(name)
  if (!path) throw new Error(`llms: no Markdown form for <${tag}> in ${file}`)
  const lang = /lang="(\w+)"/.exec(block)?.[1] ?? 'tsx'
  return read(path).then((code) => ['```' + lang, code.trimEnd(), '```'].join('\n'))
}
