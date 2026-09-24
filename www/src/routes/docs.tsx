import { Link } from '@solidjs/meta'
import { A, useLocation, type RouteSectionProps } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import { MDXProvider } from 'solid-mdx'
import { CodeBlock } from '~/components/CodeBlock'
import { Header } from '~/components/Header'
import { PageMeta } from '~/components/PageMeta'
import { DOC_PAGES, DOCS, markdownPath } from '~/docs'

/** Docs layout: sidebar + the MDX page. Links inside pages go through the router, code blocks get a copy button. */
export default function Docs(props: RouteSectionProps) {
  const location = useLocation()
  const current = () => DOC_PAGES.find((page) => page.href === location.pathname.replace(/\/$/, ''))

  return (
    <div class="mx-auto max-w-[1100px] px-5 md:px-10">
      <Show when={current()}>
        {(page) => (
          <>
            <PageMeta
              title={`${page().title} · solid-route-progress`}
              description={page().description}
              path={page().href}
            />
            {/* the Markdown twin and the llms.txt that indexes it (https://llmstxt.org) */}
            <Link rel="alternate" type="text/markdown" href={markdownPath(page().href)} />
            <Link rel="describedby" href="/llms.txt" />
          </>
        )}
      </Show>
      <Header />
      <div class="grid gap-8 py-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <nav
          aria-label="Documentation"
          class="flex gap-8 overflow-x-auto pb-2 lg:sticky lg:top-10 lg:block lg:self-start lg:pb-0"
        >
          <For each={DOCS}>
            {(group) => (
              <div class="min-w-max lg:mb-7">
                <p class="mb-2 font-mono text-[9.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {group.group}
                </p>
                <ul class="flex gap-1 lg:block lg:space-y-0.5">
                  <For each={group.pages}>
                    {(page) => (
                      <li>
                        <A
                          href={page.href}
                          end
                          class="block rounded-lg px-2.5 py-1.5 text-[13.5px] text-muted-foreground hover:bg-muted hover:text-foreground"
                          activeClass="bg-muted font-medium text-foreground"
                        >
                          {page.title}
                        </A>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </nav>
        <article class="doc min-w-0 pb-16">
          <Show when={current()}>{(page) => <PageActions href={page().href} />}</Show>
          <MDXProvider components={{ a: A, pre: CodeBlock }}>{props.children}</MDXProvider>
        </article>
      </div>
    </div>
  )
}

/** Hands the page to an assistant: its Markdown on the clipboard, or a chat that reads its `.md` copy. */
function PageActions(props: { href: string }) {
  const prompt = () =>
    encodeURIComponent(
      `Read ${__SP_SITE__}${markdownPath(props.href)}, I want to ask questions about it.`,
    )
  const chats = () => [
    { name: 'Claude', href: `https://claude.ai/new?q=${prompt()}` },
    { name: 'ChatGPT', href: `https://chatgpt.com/?hints=search&prompt=${prompt()}` },
  ]

  return (
    <div class="float-right mt-1.5 ml-4 flex gap-1.5">
      <CopyMarkdown href={props.href} />
      <For each={chats()}>
        {(chat) => (
          <a
            href={chat.href}
            target="_blank"
            rel="noopener noreferrer"
            class={`${ACTION} text-muted-foreground no-underline hover:text-foreground`}
          >
            Open in {chat.name}
          </a>
        )}
      </For>
    </div>
  )
}

const ACTION =
  'rounded-md border border-border bg-muted px-2 py-1 font-mono text-[10.5px] font-medium'

/** Copies the page as Markdown, for pasting into an assistant. */
function CopyMarkdown(props: { href: string }) {
  const [copied, setCopied] = createSignal(false)

  const copy = async () => {
    // Safari only writes to the clipboard inside the click, so it gets the pending text, not the
    // fetched one. The page URL answers Markdown to this Accept header (`src/middleware.ts`).
    const href = props.href
    const text = fetch(href, { headers: { Accept: 'text/markdown' } }).then(async (res) => {
      if (!res.ok) throw new Error(`${res.status} ${href}`)
      return new Blob([await res.text()], { type: 'text/plain' })
    })
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text })])
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={copy}
      class={`${ACTION} ${copied() ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {copied() ? 'copied' : 'Copy Markdown'}
    </button>
  )
}
