import { expect, it } from 'vitest'
import { createProgress } from '../../src'
import { update } from '../helpers'
import { RouterThenData } from './app'
import { hydratePage } from './page'

it('<RouteProgress> claims the server markup and leaves the layout and page after it alone', async () => {
  const controller = createProgress({ delay: 0 })
  const page = await hydratePage('router', () => <RouterThenData controller={controller} />)
  expect(page.warnings).toEqual([])
  expect(page.claimed()).toBe(true)
  expect(page.root.querySelector('.layout')).toHaveTextContent('layout@server')
  expect(page.root.querySelector('.page')).toHaveTextContent('page@server')

  controller.start()
  await update()
  expect(page.root.querySelector('[role=progressbar]')).toHaveAttribute('data-state', 'trickle')
  expect(page.claimed()).toBe(true)
})
