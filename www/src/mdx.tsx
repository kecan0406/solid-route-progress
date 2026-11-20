import { createContext, untrack, useContext } from 'solid-js'
import { dynamic, type JSX } from '@solidjs/web'

/** What `@mdx-js/rollup` asks the provider for (`providerImportSource`): tag → component overrides. */
export type MDXComponents = Record<string, (props: any) => JSX.Element>

/**
 * MDX renders each Markdown element as `<_components.p>`, a tag the Solid compiler takes for a
 * component, with the tag name as the fallback value. So every element Markdown, GFM and Shiki
 * (`span`) produce gets a component that renders that tag.
 */
const TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]
const ELEMENTS: MDXComponents = Object.fromEntries(TAGS.map((tag) => [tag, dynamic(() => tag)]))

const Components = createContext<MDXComponents>(ELEMENTS)

/** Overrides the elements of the MDX pages rendered inside it. The overrides are read once. */
export function MDXProvider(props: { components: MDXComponents; children?: JSX.Element }) {
  const components = { ...ELEMENTS, ...untrack(() => props.components) }
  return <Components value={components}>{props.children}</Components>
}

export const useMDXComponents = (): MDXComponents => useContext(Components)
