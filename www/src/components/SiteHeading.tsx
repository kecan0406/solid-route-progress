import { Show } from 'solid-js'
import type { ShowcaseEntry } from '~/showcase'

/**
 * A site's name, with its mark (`image`) to the left when it has one. The mark is decorative, since
 * the name sits right beside it. `class` sizes the name and `mark` sizes the picture.
 */
export function SiteHeading(props: { entry: ShowcaseEntry; class: string; mark: string }) {
  return (
    <div class="flex items-center gap-3">
      <Show when={props.entry.image}>
        {(src) => (
          <img
            src={src()}
            alt=""
            loading="lazy"
            decoding="async"
            class={`shrink-0 object-contain ${props.mark}`}
          />
        )}
      </Show>
      <h3 class={props.class}>{props.entry.name}</h3>
    </div>
  )
}
