import type { ShikiTransformer, ThemeRegistrationRaw } from 'shiki'

/**
 * Shiki always writes an `editor.background` into the `<pre>`'s inline style, whatever the theme
 * says — and an inline style beats `.doc pre`. Strip it so the card surface stays a token.
 */
export const dropBackground: ShikiTransformer = {
  name: 'drop-background',
  pre(node) {
    const style = String(node.properties.style ?? '')
    node.properties.style = style.replace(/background-color:[^;]*;?/, '')
  },
}

/**
 * The playground snippet's palette (`.tk-*` in app.css) as a Shiki theme, so docs and playground
 * match. Shiki adds the theme name as a class on `<pre>`, so it must not be `sprogress`.
 *
 * Colors pass through verbatim, `light-dark()` included, so one theme serves both schemes; the
 * card behind them is `.doc pre`'s `var(--muted)`.
 */
export const codeTheme: ThemeRegistrationRaw = {
  name: 'docs',
  type: 'light',
  colors: {
    'editor.foreground': 'var(--foreground)',
  },
  settings: [
    { settings: { foreground: 'var(--foreground)' } },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: 'light-dark(oklch(0.52 0.02 264), oklch(0.65 0.03 264))' },
    },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'],
      settings: { foreground: 'light-dark(oklch(0.45 0.16 285), oklch(0.78 0.12 285))' },
    },
    {
      scope: ['string', 'string.template', 'punctuation.definition.string'],
      settings: { foreground: 'light-dark(oklch(0.45 0.13 150), oklch(0.8 0.13 165))' },
    },
    {
      scope: ['entity.name.tag', 'punctuation.definition.tag', 'support.class.component'],
      settings: { foreground: 'light-dark(oklch(0.48 0.17 15), oklch(0.78 0.14 10))' },
    },
    {
      scope: [
        'entity.other.attribute-name',
        'support.type.property-name',
        'variable.other.property',
        'variable.css',
      ],
      settings: { foreground: 'light-dark(oklch(0.42 0.06 264), oklch(0.8 0.05 264))' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'support.constant'],
      settings: { foreground: 'light-dark(oklch(0.5 0.14 60), oklch(0.82 0.12 75))' },
    },
  ],
}
