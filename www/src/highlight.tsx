import { For } from 'solid-js'

export type Lang = 'tsx' | 'css'

const LIVE_OPEN = ''
const LIVE_CLOSE = ''

/** Wrap a value the playground changed: `<Highlight>` paints it, `plain()` strips the markers. */
export const live = (value: string | number) => `${LIVE_OPEN}${value}${LIVE_CLOSE}`
export const plain = (text: string) => text.replaceAll(LIVE_OPEN, '').replaceAll(LIVE_CLOSE, '')

const LIVE = String.raw`(?<live>[^]*)`
const STRING = String.raw`(?<string>'[^'\n]*'|"[^"\n]*")`

// Just enough grammar for the landing snippets and `style.css`; the docs use Shiki at build time.
const GRAMMAR: Record<Lang, RegExp> = {
  tsx: new RegExp(
    [
      LIVE,
      String.raw`(?<comment>//[^\n]*)`,
      STRING,
      String.raw`(?<keyword>\b(?:import|from|const|export|default|return)\b)`,
      String.raw`(?<tag></?[A-Za-z][\w.]*|/>)`,
      String.raw`(?<prop>[\w-]+(?==))`,
    ].join('|'),
    'g',
  ),
  css: new RegExp(
    [
      LIVE,
      String.raw`(?<comment>/\*[\s\S]*?\*/)`,
      STRING,
      String.raw`(?<keyword>@[\w-]+)`,
      // a rule's selector: the line's text up to its `{`, minus the indentation
      String.raw`(?<selector>(?<=^[ \t]*)[^\s{};@/*][^{};\n]*?(?=\s*\{))`,
      String.raw`(?<prop>[\w-]+(?=\s*:))`,
    ].join('|'),
    'gm',
  ),
}

const CLASS: Record<string, string> = {
  live: 'tk-chg',
  comment: 'tk-cm',
  string: 'tk-str',
  keyword: 'tk-kw',
  tag: 'tk-tag',
  selector: 'tk-tag',
  prop: 'tk-prop',
}

interface Token {
  text: string
  kind?: string
}

function tokenize(source: string, lang: Lang): Token[] {
  const tokens: Token[] = []
  let last = 0
  for (const match of source.matchAll(GRAMMAR[lang])) {
    if (match.index > last) tokens.push({ text: source.slice(last, match.index) })
    const kind = Object.keys(match.groups!).find((name) => match.groups![name] !== undefined)!
    tokens.push({ kind, text: plain(match[0]) })
    last = match.index + match[0].length
  }
  if (last < source.length) tokens.push({ text: source.slice(last) })
  return tokens
}

/** Syntax-colored source for a `<pre>`, using the `.tk-*` palette from app.css. */
export function Highlight(props: { text: string; lang: Lang }) {
  return (
    <For each={tokenize(props.text, props.lang)}>
      {(token) => (token.kind ? <span class={CLASS[token.kind]}>{token.text}</span> : token.text)}
    </For>
  )
}
