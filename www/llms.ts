import type { Plugin } from 'vite'
import { DOCS, DOC_PAGES, INSTALL, markdownPath } from './src/docs'

/**
 * `virtual:llms`: the docs as Markdown for agents, after https://llmstxt.org — `/llms.txt` (the
 * index), `/llms-full.txt` (every page in one file), and a `.md` copy of each page. Built from the
 * same `.mdx` sources as the HTML pages; `src/middleware.ts` serves them.
 */
export function llms(site: {
  origin: string
  name: string
  description: string
  repo: string
  peers: Record<string, string>
}): Plugin {
  const id = 'virtual:llms'
  const docsDir = new URL('./src/routes/docs/', import.meta.url)

  return {
    name: 'llms',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    async load(loaded) {
      if (loaded !== `\0${id}`) return
      const read = (url: URL) => {
        const path = decodeURIComponent(url.pathname)
        this.addWatchFile(path)
        return this.fs.readFile(path, { encoding: 'utf8' })
      }
      const pages = await Promise.all(
        DOC_PAGES.map(async (page) => ({
          ...page,
          markdown: await pageMarkdown(new URL(`${page.file}.mdx`, docsDir), site.origin, read),
        })),
      )

      const files: Record<string, string> = {}
      for (const page of pages) files[markdownPath(page.href)] = page.markdown
      files['/llms.txt'] = [
        `# ${site.name}`,
        `> ${site.description}`,
        [
          `Install with \`${INSTALL[0]!.command}\` and import \`${site.name}/style.css\` once.`,
          `Peer dependencies: ${Object.entries(site.peers)
            .map(([name, range]) => `\`${name}\` ${range}`)
            .join(', ')} (the router one only for \`${site.name}/router\`).`,
          `Every link below is a Markdown copy of a docs page; drop the \`.md\` for the HTML page.`,
        ].join('\n'),
        ...DOCS.map(({ group, pages }) =>
          [
            `## ${group}`,
            ...pages.map(
              (page) =>
                `- [${page.title}](${site.origin}${markdownPath(page.href)}): ${page.description}`,
            ),
          ].join('\n'),
        ),
        [
          '## Optional',
          `- [All docs in one file](${site.origin}/llms-full.txt): every page above, concatenated`,
          `- [Changelog](${site.repo}/blob/main/CHANGELOG.md): release notes`,
          `- [Source](${site.repo}): the repository`,
        ].join('\n'),
      ].join('\n\n')
      files['/llms-full.txt'] = pages
        .map((page) =>
          page.markdown.replace(/^# .*/, (h1) => `${h1}\n\nSource: ${site.origin}${page.href}`),
        )
        .join('\n\n---\n\n')

      return `export default ${JSON.stringify(files)}`
    },
  }
}

/**
 * One `.mdx` page as plain Markdown: imports go, every JSX block becomes the code block it shows,
 * and docs links point at their Markdown copies. A JSX block with no Markdown form fails the build.
 */
async function pageMarkdown(file: URL, origin: string, read: (url: URL) => Promise<string>) {
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
      return `](${origin}${markdownPath(path)}${hash})`
    })
    .trim()
}

function jsxMarkdown(
  tag: string,
  block: string,
  raw: Map<string, URL>,
  read: (url: URL) => Promise<string>,
  file: URL,
) {
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
