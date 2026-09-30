import { ImageCredit } from '~/components/ImageCredit'
import { ShowcasePreview } from '~/components/ShowcasePreview'
import { SiteHeading } from '~/components/SiteHeading'
import type { ShowcaseEntry } from '~/showcase'

/** One site on `/showcase`. */
export function ShowcaseCard(props: { entry: ShowcaseEntry }) {
  return (
    <article class="grid min-w-0 grid-rows-[auto_1fr] overflow-hidden rounded-[14px] border border-border bg-card">
      <ShowcasePreview class="aspect-[16/10] pt-[18px] pl-[18px]" />
      <div class="flex min-w-0 flex-col gap-2.5 px-5 pt-[18px] pb-5">
        <SiteHeading
          entry={props.entry}
          class="text-[18px] font-semibold tracking-[-0.02em]"
          mark="size-8"
        />
        <p class="text-[14.5px] text-muted-foreground">{props.entry.description}</p>
        <a
          href={props.entry.url}
          target="_blank"
          rel="noopener noreferrer"
          class="mt-auto w-fit pt-2.5 text-[14px] font-semibold underline underline-offset-4"
        >
          {props.entry.name} ↗
        </a>
        <ImageCredit entry={props.entry} />
      </div>
    </article>
  )
}

/** The empty slot after the last entry: where the next site goes. */
export function ShowcaseSlot() {
  return (
    <article class="flex min-h-[220px] flex-col justify-center gap-2 rounded-[14px] border border-dashed border-border p-7">
      <p class="font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
        Your site
      </p>
      <h3 class="text-[18px] font-semibold tracking-[-0.02em]">Add it here</h3>
      <p class="max-w-[34ch] text-muted-foreground">
        Have you adopted solid-route-progress? Add a file and GitHub opens the pull request for you.
      </p>
      <a href="#add" class="w-fit text-[13.5px] font-medium underline underline-offset-4">
        How to add →
      </a>
    </article>
  )
}
