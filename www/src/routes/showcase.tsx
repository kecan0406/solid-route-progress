import { For, type JSX } from 'solid-js'
import { CodeFile } from '~/components/CodeFile'
import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import { PageMeta } from '~/components/PageMeta'
import { ShowcaseCard, ShowcaseSlot } from '~/components/ShowcaseCard'
import { ADD_SITE, ADD_SITE_ISSUE, SHOWCASE } from '~/showcase'
// the sample is the first real entry, so it cannot drift from the format
import sample from '../../showcase/hackers-pub.json?raw'

const Code = (props: { children: JSX.Element }) => (
  <code class="rounded-md border border-border bg-muted px-[5px] py-px font-mono text-[0.86em] text-foreground">
    {props.children}
  </code>
)

export default function Showcase() {
  return (
    <div class="mx-auto max-w-[1040px] px-5 md:px-10">
      <PageMeta
        title="Showcase · solid-route-progress"
        description="Sites and apps that show a route progress bar drawn by solid-route-progress."
        path="/showcase"
      />
      <Header />
      <main class="flex flex-col gap-11 pt-6 pb-11">
        <div class="flex flex-col gap-3">
          <h1 class="text-[34px] leading-[1.1] font-semibold tracking-[-0.03em]">Showcase</h1>
          <p class="max-w-[52ch] text-[16px] text-muted-foreground">
            Sites that show a route progress bar drawn by solid-route-progress.
          </p>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <For each={SHOWCASE}>{(entry) => <ShowcaseCard entry={entry} />}</For>
          <ShowcaseSlot />
        </div>
        <section
          id="add"
          aria-labelledby="add-heading"
          class="flex flex-col gap-3 border-t border-border pt-[22px]"
        >
          <h2 id="add-heading" class="text-[21px] font-semibold tracking-[-0.02em]">
            Add your project
          </h2>
          <p class="max-w-[58ch] text-[15px] text-muted-foreground">
            Add one file to <Code>www/showcase/</Code>. GitHub forks the repository and opens the
            pull request for you, so there is nothing to clone.
          </p>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2.5 py-1">
            <a
              href={ADD_SITE}
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground hover:brightness-110"
            >
              Add on GitHub ↗
            </a>
            <a
              href={ADD_SITE_ISSUE}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[13.5px] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Prefer a form? Open an issue ↗
            </a>
          </div>
          <CodeFile file="www/showcase/hackers-pub.json" text={sample.trimEnd()} lang="json" />
          <p class="max-w-[58ch] text-[13.5px] text-muted-foreground">
            <Code>image</Code> and <Code>credit</Code> are optional: a mark shown left of the name,
            and who made it. Have a logo? Drop it (SVG or PNG) in a comment on your pull request,
            with its maker and license, and we will add both.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
