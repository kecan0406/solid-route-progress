import { A } from '@solidjs/router'
import { createProgress, useProgress } from 'solid-route-progress'
import { CodeCard } from '~/components/CodeCard'
import { Dock } from '~/components/Dock'
import { Header } from '~/components/Header'
import { Hero } from '~/components/Hero'
import { REPO } from '~/links'
import { Simulator } from '~/components/Simulator'
import { cfg } from '~/playground'

export default function Landing() {
  // The page's bar is the site-wide one; the demo card gets its own. Nothing fakes a load here:
  // the site's bar only moves for real navigations and for what the demo card holds.
  const pageCtl = useProgress()
  const winCtl = createProgress({
    get speed() {
      return cfg.speed
    },
  })

  return (
    <div class="mx-auto max-w-[1280px] px-5 md:px-10 lg:px-12">
      <Header />
      <main class="flex flex-col gap-8 pb-8">
        <Hero />
        <Simulator pageCtl={pageCtl} winCtl={winCtl} />
        <Dock winCtl={winCtl} />
        <CodeCard />
      </main>
      <footer class="mx-auto flex w-full max-w-[960px] items-center gap-4 pb-8 text-[13px] text-muted-foreground">
        <span>MIT</span>
        <A href="/docs" class="underline underline-offset-4 hover:text-foreground">
          Docs
        </A>
        <a href={REPO} class="underline underline-offset-4 hover:text-foreground">
          GitHub
        </a>
        <a
          href="https://github.com/orioncactus/pretendard/blob/main/LICENSE"
          class="underline underline-offset-4 hover:text-foreground"
        >
          Pretendard (OFL 1.1)
        </a>
        <span class="ml-auto font-mono text-[11px]">v{__SP_VERSION__}</span>
      </footer>
    </div>
  )
}
