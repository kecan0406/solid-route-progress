import { expect, it } from 'vitest'
import { createProgress } from '../../src'
import { update } from '../helpers'
import { BarThenData } from './app'
import { hydratePage } from './page'

it('<Progress> claims the server markup and leaves the ids after it alone', async () => {
  const controller = createProgress({ delay: 0 })
  const page = await hydratePage('bar', () => <BarThenData controller={controller} />)
  expect(page.warnings).toEqual([])
  expect(page.claimed()).toBe(true)
  expect(page.root.querySelector('.after-bar')).toHaveTextContent('after-bar@server')

  controller.start()
  await update()
  expect(page.root.querySelector('[role=progressbar]')).toHaveAttribute('data-state', 'trickle')
  expect(document.documentElement).toHaveAttribute('data-sp-busy')
  expect(page.claimed()).toBe(true)
})
