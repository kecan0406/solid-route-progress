import { Show } from 'solid-js'
import type { ShowcaseEntry } from '~/showcase'

const LINK = 'underline underline-offset-4 hover:text-foreground'

/** The credit for a card's `image`, which its license asks for: the maker and the license, both linked. */
export function ImageCredit(props: { entry: ShowcaseEntry; class?: string }) {
  return (
    <Show when={props.entry.credit}>
      {(credit) => (
        <p class={`text-[11px] text-muted-foreground ${props.class ?? ''}`}>
          <a href={credit().url} target="_blank" rel="noopener noreferrer" class={LINK}>
            {credit().text}
          </a>{' '}
          (
          <a href={credit().licenseUrl} target="_blank" rel="noopener noreferrer" class={LINK}>
            {credit().license}
          </a>
          )
        </p>
      )}
    </Show>
  )
}
