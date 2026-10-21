import { createMemo, Loading } from 'solid-js'
import { isServer } from '@solidjs/web'
import { createRouter, memoryHistory } from '@solidjs/router'
import { Progress, type ProgressController } from '../../src'
import { RouteProgress } from '../../src/router'

/**
 * The pages both sides render: the server to HTML (`render.tsx`), the client to hydrate it
 * (`hydrate.test.tsx`). Each puts something after the bar that hydration finds by id, so a
 * node the bar created on one side only would shift it.
 */

/**
 * Each side answers differently, so the page tells whether hydration adopted the server's answer
 * (`@server`) or lost its id and loaded again (`@client`).
 */
const load = async (key: string) => {
  await Promise.resolve()
  return `${key}@${isServer ? 'server' : 'client'}`
}

/** Rendered after the bar: an async value the server serialized, and an element to claim. */
const After = (props: { name: string }) => {
  const data = createMemo(() => load(props.name))
  return <p class={props.name}>{data()}</p>
}

/** The control: the same data with no bar before it, which shows what clean hydration does. */
export const DataAlone = () => (
  <Loading>
    <After name="alone" />
  </Loading>
)

export const BarThenData = (props: { controller: ProgressController }) => (
  <>
    <Progress controller={props.controller} />
    <Loading>
      <After name="after-bar" />
    </Loading>
  </>
)

const Router = createRouter({
  routes: [
    {
      path: '/',
      component: () => (
        <Loading>
          <After name="page" />
        </Loading>
      ),
    },
  ],
  history: memoryHistory('/'),
})

export const RouterThenData = (props: { controller: ProgressController }) => (
  <Router>
    {(route) => (
      <>
        <RouteProgress controller={props.controller} crossDocument={false} />
        <Loading>
          <After name="layout" />
        </Loading>
        {route.children}
      </>
    )}
  </Router>
)
