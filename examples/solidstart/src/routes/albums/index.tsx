import { A, createAsync, type RouteDefinition } from '@solidjs/router'
import { For } from 'solid-js'
import { getAlbums } from '~/lib/albums'

export const route = { preload: () => getAlbums() } satisfies RouteDefinition

export default function Albums() {
  const albums = createAsync(() => getAlbums())

  return (
    <>
      <h1 class="mb-6 text-3xl font-semibold tracking-tight">Albums</h1>
      <ul class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <For each={albums()}>
          {(album) => (
            <li>
              <A href={`/albums/${album.id}`} class="flex justify-between py-3 hover:underline">
                <span>{album.title}</span>
                <span class="text-sm text-zinc-500">1.5 s</span>
              </A>
            </li>
          )}
        </For>
      </ul>
    </>
  )
}
