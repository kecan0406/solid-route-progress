import { A } from '@solidjs/router'
import { Show } from 'solid-js'
import { ImageCredit } from '~/components/ImageCredit'
import { ShowcasePreview } from '~/components/ShowcasePreview'
import { SiteHeading } from '~/components/SiteHeading'
import { SHOWCASE, type ShowcaseEntry } from '~/showcase'

/** The landing page's last section: the first showcase entry as a card, and the way in for the next. */
export function ShowcaseSection() {
  return (
    <section
      aria-labelledby="showcase-heading"
      class="mx-auto mt-3 flex w-full max-w-[960px] flex-col gap-5"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
        <h2
          id="showcase-heading"
          class="text-[26px] leading-[1.15] font-semibold tracking-[-0.03em]"
        >
          Showcase
        </h2>
        <A
          href="/showcase"
          class="py-1.5 text-[13.5px] font-medium whitespace-nowrap text-muted-foreground hover:text-foreground"
        >
          View all →
        </A>
      </div>
      <Show when={SHOWCASE[0]}>{(entry) => <FeatureCard entry={entry()} />}</Show>
      <p class="flex flex-wrap gap-x-2 gap-y-1 text-[13.5px] text-muted-foreground">
        Have you adopted solid-route-progress?
        <A href="/showcase#add" class="font-medium text-foreground underline underline-offset-4">
          Add your site →
        </A>
      </p>
    </section>
  )
}

function FeatureCard(props: { entry: ShowcaseEntry }) {
  return (
    <article class="grid overflow-hidden rounded-[14px] border border-border bg-card md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <ShowcasePreview class="min-h-[200px] pt-[22px] pl-[22px] md:min-h-[240px]" />
      <div class="flex min-w-0 flex-col justify-center gap-3 p-5 md:px-[26px] md:py-6">
        <SiteHeading
          entry={props.entry}
          class="text-2xl leading-[1.1] font-semibold tracking-[-0.03em]"
          mark="size-10"
        />
        <p class="max-w-[40ch] text-[14.5px] text-muted-foreground">{props.entry.description}</p>
        <a
          href={props.entry.url}
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 w-fit rounded-lg bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground hover:brightness-110"
        >
          Visit {props.entry.name} ↗
        </a>
        <ImageCredit entry={props.entry} class="pt-1" />
      </div>
    </article>
  )
}
