import { query } from '@solidjs/router'

const ALBUMS = [
  { id: '1', title: 'Cubic Bézier Blues', artist: 'The Curves', year: 2026 },
  { id: '2', title: 'Linear Easing', artist: 'Keyframe Club', year: 2025 },
  { id: '3', title: 'Transition End', artist: 'Composite Layer', year: 2024 },
]

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Slow on purpose, so the bar has something to show: it stays open while the next route's
// <Suspense> waits on these, with nothing to wire up beyond ★ 4.
export const getAlbums = query(async () => {
  await sleep(800)
  return ALBUMS
}, 'albums')

export const getAlbum = query(async (id: string) => {
  await sleep(1500)
  return ALBUMS.find((album) => album.id === id)
}, 'album')
