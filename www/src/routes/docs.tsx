import { Title } from '@solidjs/meta'
import { A, useLocation, type RouteSectionProps } from '@solidjs/router'
import { For } from 'solid-js'
import { MDXProvider } from 'solid-mdx'
import { CodeBlock } from '~/components/CodeBlock'
import { Header } from '~/components/Header'

const NAV = [
  {
    group: 'Getting started',
    pages: [
      { href: '/docs', title: 'Introduction' },
      { href: '/docs/installation', title: 'Installation' },
      { href: '/docs/quick-start', title: 'Quick start' },
      { href: '/docs/styling', title: 'Styling' },
    ],
  },
  {
    group: 'Examples',
    pages: [{ href: '/docs/examples', title: 'Examples' }],
  },
  {
    group: 'API',
    pages: [
      { href: '/docs/controller', title: 'Controller' },
      { href: '/docs/components', title: 'Components' },
      { href: '/docs/router', title: 'Router integration' },
      { href: '/docs/navigation-api', title: 'Navigation API' },
    ],
  },
]

/** Docs layout: sidebar + the MDX page. Links inside pages go through the router, code blocks get a copy button. */
export default function Docs(props: RouteSectionProps) {
  const location = useLocation()
  const current = () =>
    NAV.flatMap((group) => group.pages).find(
      (page) => page.href === location.pathname.replace(/\/$/, ''),
    )

  return (
    <div class="mx-auto max-w-[1100px] px-5 md:px-10">
      <Title>{`${current()?.title ?? 'Docs'} · sprogress`}</Title>
      <Header />
      <div class="grid gap-8 py-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <nav
          aria-label="Documentation"
          class="flex gap-8 overflow-x-auto pb-2 lg:sticky lg:top-10 lg:block lg:self-start lg:pb-0"
        >
          <For each={NAV}>
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
          <MDXProvider components={{ a: A, pre: CodeBlock }}>{props.children}</MDXProvider>
        </article>
      </div>
    </div>
  )
}
