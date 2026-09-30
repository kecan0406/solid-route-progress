import { A } from '@solidjs/router'
import { REPO } from '~/links'

const LINK = 'underline underline-offset-4 hover:text-foreground'

/** The landing page's and /showcase's footer: license, the site's pages, and the version. */
export function Footer() {
  return (
    <footer class="mx-auto flex w-full max-w-[960px] flex-wrap items-center gap-x-4 gap-y-1.5 pb-8 text-[13px] text-muted-foreground">
      <span>MIT</span>
      <A href="/docs" class={LINK}>
        Docs
      </A>
      <A href="/showcase" class={LINK}>
        Showcase
      </A>
      <a href={REPO} class={LINK}>
        GitHub
      </a>
      <a href="https://github.com/orioncactus/pretendard/blob/main/LICENSE" class={LINK}>
        Pretendard (OFL 1.1)
      </a>
      <span class="ml-auto font-mono text-[11px]">v{__SP_VERSION__}</span>
    </footer>
  )
}
