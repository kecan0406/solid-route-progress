import type { JSX } from 'solid-js'
import { CodeBlock } from '~/components/CodeBlock'
import { Highlight } from '~/highlight'

/**
 * A live example and the file that draws it. `source` is that same file, imported with `?raw`,
 * so the code on the page is the code that is running.
 */
export function Example(props: { source: string; children: JSX.Element }) {
  return (
    <div class="example mb-6">
      <div class="mb-3">{props.children}</div>
      <CodeBlock>
        <Highlight text={props.source} lang="tsx" />
      </CodeBlock>
    </div>
  )
}
