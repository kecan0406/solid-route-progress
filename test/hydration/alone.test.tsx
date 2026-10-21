import { expect, it } from 'vitest'
import { DataAlone } from './app'
import { hydratePage } from './page'

// The control: with no bar before it, the data is claimed and adopted, which the other pages
// are measured against.
it('claims the server markup and adopts the data it serialized', async () => {
  const page = await hydratePage('alone', () => <DataAlone />)
  expect(page.warnings).toEqual([])
  expect(page.claimed()).toBe(true)
  expect(page.root.querySelector('.alone')).toHaveTextContent('alone@server')
})
