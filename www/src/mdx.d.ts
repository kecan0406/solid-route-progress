declare module '*.mdx' {
  import type { Component } from 'solid-js'
  const Content: Component
  export default Content
}

// solid-mdx ships types outside its `exports` map, so TypeScript cannot see them.
declare module 'solid-mdx' {
  import type { JSX } from 'solid-js'
  type Components = Record<string, (props: any) => JSX.Element>
  export function MDXProvider(props: {
    components: Components
    children?: JSX.Element
  }): JSX.Element
  export function useMDXComponents(): Components
}
