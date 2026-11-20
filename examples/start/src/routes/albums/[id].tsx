import { type RouteDefinition, type RouteProps } from '@solidjs/router'
import { createMemo, Show } from 'solid-js'
import { getAlbum } from '../../lib/albums'

export const route = {
  preload: ({ params }) => void getAlbum(params.id!),
} satisfies RouteDefinition

export default function Album(props: RouteProps<'/albums/:id'>) {
  const album = createMemo(() => getAlbum(props.params.id))

  return (
    <Show when={album()} fallback={<p>Album not found.</p>}>
      {(album) => (
        <>
          <h1 class="mb-2 text-3xl font-semibold tracking-tight">{album().title}</h1>
          <p class="mb-8 text-zinc-600 dark:text-zinc-400">
            {album().artist} · {album().year}
          </p>
          <a href="/albums" class="text-sm underline">
            ← All albums
          </a>
        </>
      )}
    </Show>
  )
}
