import { A, createAsync, useParams, type RouteDefinition } from '@solidjs/router'
import { Show } from 'solid-js'
import { getAlbum } from '~/lib/albums'

export const route = {
  preload: ({ params }) => getAlbum(params.id!),
} satisfies RouteDefinition

export default function Album() {
  const params = useParams()
  const album = createAsync(() => getAlbum(params.id!))

  return (
    <Show when={album()} fallback={<p>Album not found.</p>}>
      {(album) => (
        <>
          <h1 class="mb-2 text-3xl font-semibold tracking-tight">{album().title}</h1>
          <p class="mb-8 text-zinc-600 dark:text-zinc-400">
            {album().artist} · {album().year}
          </p>
          <A href="/albums" class="text-sm underline">
            ← All albums
          </A>
        </>
      )}
    </Show>
  )
}
