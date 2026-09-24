# solid-route-progress

[![npm](https://img.shields.io/npm/v/solid-route-progress.svg)](https://www.npmjs.com/package/solid-route-progress)
[![CI](https://github.com/kecan0406/solid-route-progress/actions/workflows/ci.yml/badge.svg)](https://github.com/kecan0406/solid-route-progress/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A route progress bar for [SolidJS](https://solidjs.com), in the spirit of [NProgress](https://github.com/rstacruz/nprogress) and [BProgress](https://bprogress.vercel.app/). The loading drift is one CSS transition, so you theme and retime it from CSS.

[![Progress, drawn in CSS](https://solid-route-progress.vercel.app/og.png)](https://solid-route-progress.vercel.app)

**[Documentation](https://solid-route-progress.vercel.app/docs)** · **[Live demo](https://solid-route-progress.vercel.app)** · **[Example on StackBlitz](https://stackblitz.com/github/kecan0406/solid-route-progress/tree/main/examples/solidstart?file=src/app.tsx)**

## Why solid-route-progress?

- **One line with `@solidjs/router`.** `<RouteProgress />` follows `useIsRouting()`, so links, `navigate()`, back/forward, action redirects and every `<Suspense>` the next route waits on all show the bar.
- **Drawn in CSS.** No JavaScript timer steps the bar forward: the drift is a single CSS transition, and color, height and timing are custom properties.
- **Quick loads never flash.** A navigation shorter than `delay` (200 ms) draws nothing.
- **Every load holds it separately.** Routes, `track(fetch(...))` and your own `start()` each hold the bar, and it completes when the last one lets go.
- **Beyond the router.** Navigations that leave the page (external links, form posts, reloads) show it through the Navigation API, and `solid-route-progress/navigation` works without a router at all.
- **Tailwind v4, SSR and accessibility.** Styles sit in a cascade layer so utilities win without `!important`, `data-state` works as a variant, it renders on the server, and it is a labeled `role="progressbar"` that follows `dir="rtl"` and forced colors.
- **Small.** About 2.8 kB min+gzip with the router integration, and no dependencies.

## Installation

```sh
npm i solid-route-progress
```

Or `pnpm add`, `yarn add`, `bun add`. It needs `solid-js` 1.9 or later, and `@solidjs/router` 0.15 or later for the router integration. The bar draws in Chrome and Edge 111, Firefox 113 and Safari 15.4 or later; see [browser support](https://solid-route-progress.vercel.app/docs/installation#browsers).

## Usage

Import the stylesheet once:

```css
/* src/app.css */
@import 'tailwindcss'; /* optional */
@import 'solid-route-progress/style.css';
```

Render the bar once under `<Router>`. With SolidStart:

```tsx
// src/app.tsx
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { RouteProgress } from 'solid-route-progress/router'
import './app.css'

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <RouteProgress />
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
```

Theme it with custom properties, on `:root` or anywhere else:

```css
:root {
  --sp-color: oklch(0.62 0.19 264); /* or a Tailwind token: var(--color-indigo-500) */
  --sp-height: 2px;
}
```

Hold it for work that is not a navigation. Wrap the app in `<ProgressProvider>`, and `useProgress()` reaches the same bar from anywhere:

```tsx
const progress = useProgress()
progress.track(fetch('/api/items')) // shows the bar until the request settles
```

Without `@solidjs/router`, render `<NavigationProgress />` from `solid-route-progress/navigation` instead. For server rendering, use a bundler that resolves the `solid` export condition, as SolidStart and `vite-plugin-solid` do.

## Documentation

| Page                                                                          | Covers                                                                             |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Quick start](https://solid-route-progress.vercel.app/docs/quick-start)       | `@solidjs/router`, SolidStart, no router, and driving the bar yourself             |
| [Styling](https://solid-route-progress.vercel.app/docs/styling)               | custom properties, Tailwind utilities, state hooks, custom templates, recipes      |
| [Controller](https://solid-route-progress.vercel.app/docs/controller)         | `createProgress()` options, `start()`, `done()`, `set()`, `track()`, and the types |
| [Components](https://solid-route-progress.vercel.app/docs/components)         | `<Progress>`, `<ProgressProvider>`, `useProgress()`, `<Bar>`                       |
| [Router integration](https://solid-route-progress.vercel.app/docs/router)     | ignored links, navigations that leave the page, actions without a redirect         |
| [Navigation API](https://solid-route-progress.vercel.app/docs/navigation-api) | `<NavigationProgress>`, for apps without a router                                  |
| [Examples](https://solid-route-progress.vercel.app/docs/examples)             | live demos of each API                                                             |

The docs are also Markdown for AI assistants: [`llms.txt`](https://solid-route-progress.vercel.app/llms.txt) and [`llms-full.txt`](https://solid-route-progress.vercel.app/llms-full.txt).

## Coming from NProgress / BProgress

| There                                            | Here                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `minimum`                                        | `--sp-start`                                                                                                                        |
| `trickleSpeed`, `easing`, `speed`                | `--sp-trickle-duration`, `--sp-trickle-easing`, `speed` / `--sp-speed`                                                              |
| `trickle: false`                                 | `trickleTo` equal to `--sp-start`: the bar reveals and waits for `set()` / `done()`                                                 |
| `color`, `height`, `template`                    | `--sp-color`, `--sp-height`, children                                                                                               |
| `showSpinner`, `spinnerPosition`                 | the [spinner recipe](https://solid-route-progress.vercel.app/docs/styling#spinner), placed with your own `top` / `inset-inline-end` |
| `parent`                                         | render the bar [inside the container](https://solid-route-progress.vercel.app/docs/styling#inside-a-container), `class="absolute"`  |
| `direction: 'rtl'`                               | automatic under `dir="rtl"`                                                                                                         |
| `startPosition`, `delay`, `stopDelay`            | `set(n)`, `delay` (default 200 ms), `stopDelay`                                                                                     |
| `shallowRouting`, `targetPreprocessor`           | `shallow`, `filter(to, from)`                                                                                                       |
| `disableSameURL`                                 | built in: navigations the router drops never show a bar                                                                             |
| `data-disable-progress`, `data-prevent-progress` | `data-sp-ignore`                                                                                                                    |
| `promise()`                                      | `track(promise)`; `start()` returns its own release                                                                                 |
| `inc()`, `dec()`, `pause()`, `resume()`          | none: the drift is a CSS transition, so JS holds no current position to step or freeze. Stepwise loads: `set(k / n)`.               |
| `indeterminate`                                  | none: trickling already reads as indeterminate to assistive tech; style `data-state="trickle"` as you like                          |
| `nonce`, `style`, `disableStyle`, `memo`         | not needed: styles are a stylesheet you import, components are plain Solid                                                          |

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and report security issues as described in [SECURITY.md](SECURITY.md).

## License

MIT
