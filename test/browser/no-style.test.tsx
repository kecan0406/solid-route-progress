import { expect, it, vi } from 'vitest'
import { render } from 'solid-js/web'
import { Progress } from '../../src'

// Deliberately no `style.css` import: this file runs in its own page.
it('warns in development when style.css is missing', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const dispose = render(() => <Progress />, document.body)
  expect(warn).toHaveBeenCalledWith(expect.stringMatching(/style\.css/))
  dispose()
})
