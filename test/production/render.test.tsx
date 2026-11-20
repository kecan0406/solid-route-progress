import { expect, it } from 'vitest'
import { isDev, render } from '@solidjs/web'
import { Progress } from '../../src'

// The development-only branches fold away here, so what they leave behind must still render.
it('renders the bar in a production build', () => {
  expect(isDev).toBe(false)
  const dispose = render(() => <Progress />, document.body)
  expect(document.querySelector('.sprogress[role="progressbar"]')).not.toBeNull()
  dispose()
})
