import { createMiddleware } from '@solidjs/start/middleware'
import files from 'virtual:llms'
import { markdownPath } from '~/docs'

/**
 * The docs for agents (see `llms.ts`): `/llms.txt`, `/llms-full.txt`, `/docs/<page>.md`, and the
 * page URL itself for a client that asks for `text/markdown` over `text/html`.
 */
export default createMiddleware([
  (event) => {
    const path = event.url.pathname
    const file = files[path]
    if (file !== undefined) {
      const page = path.endsWith('.md') ? path.slice(0, -'.md'.length) : undefined
      return respond(file, page)
    }

    const markdown = files[markdownPath(path.replace(/(.)\/$/, '$1'))]
    if (markdown === undefined) return
    // the same URL answers HTML or Markdown, so caches must key on Accept
    event.res.headers.append('Vary', 'Accept')
    if (prefersMarkdown(event.req.headers.get('accept'))) return respond(markdown, path)
  },
])

function respond(body: string, page: string | undefined) {
  const headers = new Headers({
    'Content-Type': `${page ? 'text/markdown' : 'text/plain'}; charset=utf-8`,
    Vary: 'Accept',
  })
  // search engines index the HTML page, not its Markdown twin
  if (page) headers.set('Link', `<${__SP_SITE__}${page}>; rel="canonical"`)
  return new Response(body, { headers })
}

/** `true` when `text/markdown` is listed with a quality at least that of `text/html`. */
function prefersMarkdown(accept: string | null) {
  const quality = (type: string) => {
    for (const range of accept?.split(',') ?? []) {
      const [name, ...params] = range.split(';').map((part) => part.trim())
      if (name !== type) continue
      const q = params.find((param) => param.startsWith('q='))
      return q ? Number(q.slice(2)) : 1
    }
    return 0
  }
  const markdown = quality('text/markdown')
  return markdown > 0 && markdown >= quality('text/html')
}
