# solid-route-progress

[![npm](https://img.shields.io/npm/v/solid-route-progress.svg)](https://www.npmjs.com/package/solid-route-progress)
[![CI](https://github.com/kecan0406/solid-route-progress/actions/workflows/ci.yml/badge.svg)](https://github.com/kecan0406/solid-route-progress/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Docs and a live demo: https://solid-route-progress.vercel.app

A web-native route progress bar for [SolidJS](https://solidjs.com) and [`@solidjs/router`](https://github.com/solidjs/solid-router), in the spirit of [NProgress](https://github.com/rstacruz/nprogress) and [BProgress](https://bprogress.vercel.app/):

- CSS does the animating: JavaScript writes the target value (`--sp-value`), the hop speed (`--sp-speed`), and one attribute (`data-state`). The loading trickle is a single long CSS transition, and no JS timer steps the bar forward. You can change its motion, color, and shape in CSS. `--sp-value` is registered with `@property`, so an element of your own can transition it too, such as a `conic-gradient()` ring.
- Quick loads never draw: A navigation shorter than `delay` (200 ms by default) shows nothing. Even with `delay: 0`, one that settles before the next frame is dropped.
- Tailwind CSS v4 ready: Styles ship in the `components.sprogress` sublayer, so utilities, your own `@layer components` rules, and unlayered CSS all win without `!important`. `data-state`, `data-error`, and `<html data-sp-busy>` work as Tailwind variants.
- Tiny: The core is about 2.1 kB min+gzip (the headless `createProgress` alone tree-shakes to about 0.8 kB), the router integration about 0.6 kB, the Navigation API one about 0.5 kB, and the CSS about 0.5 kB. It has no dependencies.
- Covers the whole navigation: It hooks `useIsRouting()`, so `<A>` clicks, `navigate()`, back/forward, action redirects, and every `<Suspense>` the new route waits on all show the bar. Navigations the page starts that leave the document (external links, plain form posts, `location.reload()`) show it too, through the Navigation API.
- SSR-safe and RTL-aware: It renders the idle shell on the server and exposes a labeled `role="progressbar"`. The bar is indeterminate while trickling, and once you `set()` a value it gets `aria-valuenow`, plus `aria-valuetext` from `getValueLabel`. It flips direction under `dir="rtl"` and paints with the system `Highlight` color under forced colors.

## Install

```sh
pnpm add solid-route-progress
```

Peer dependencies: `solid-js ^1.9` and, for the router integration, `@solidjs/router >= 1.0`.

Server rendering needs a bundler that resolves the `solid` export condition (`vite-plugin-solid`, SolidStart): the `default` export is compiled for the DOM.

The stylesheet uses modern CSS: `@layer`, `@property`, `linear()`, `oklch()` and `:dir()`. A browser without one of them may draw the bar wrongly or not at all.

## Quick start (with `@solidjs/router`)

```css
/* app.css */
@import 'tailwindcss'; /* optional */
@import 'solid-route-progress/style.css';
```

```tsx
import { Router, Route } from '@solidjs/router'
import { Suspense } from 'solid-js'
import { RouteProgress } from 'solid-route-progress/router'

const Layout = (props) => (
  <>
    <RouteProgress />
    <Suspense>{props.children}</Suspense>
  </>
)

<Router root={Layout}>
  <Route path="/" component={Home} />
</Router>
```

Render `<RouteProgress />` once anywhere under `<Router>`, and import the stylesheet once.

### SolidStart

It takes the same two steps: import the stylesheet in `src/app.css`, and render the bar in the `<Router>` root of `src/app.tsx`.

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

## Styling

Every tunable is a CSS custom property with a fallback, so you can set it on `:root`, in Tailwind's `@theme`, on a class, or inline:

| Property                | Default                | What it does                     |
| ----------------------- | ---------------------- | -------------------------------- |
| `--sp-color`            | `oklch(0.65 0.14 241)` | bar color                        |
| `--sp-height`           | `3px`                  | bar thickness                    |
| `--sp-z-index`          | `9999`                 | bar stacking order               |
| `--sp-start`            | `0.08`                 | value the bar is revealed at     |
| `--sp-trickle-duration` | `10s`                  | how long the loading drift takes |
| `--sp-trickle-easing`   | `linear(…)`            | shape of the drift               |

`--sp-speed` (the `set()`/`done()` hop and fade duration) is written from the `speed` option so the CSS transitions and the JS timers share one clock: read it in your own rules, set it through `speed`.

```css
:root {
  /* any CSS color, or a Tailwind v4 token: var(--color-indigo-500) */
  --sp-color: oklch(0.62 0.19 264);
  --sp-height: 2px;
}
```

`oklch()` suits a bar well: keep the lightness and chroma and turn the hue, and the colors keep the same visual weight. Follow the color scheme with `light-dark()`:

```css
:root {
  color-scheme: light dark;
  --sp-color: light-dark(oklch(0.55 0.2 264), oklch(0.75 0.12 264));
}
```

Or use utilities, which beat the component layer without `!important`:

```tsx
<RouteProgress class="h-1 data-[state=done]:opacity-50" />
```

### Inside a container

The bar is a normal component. Render it inside the container and make it `absolute` instead of `fixed`. The container needs `position: relative` and `overflow: hidden`.

```tsx
<div class="relative overflow-hidden rounded-xl">
  <Progress controller={panel} class="absolute" />…
</div>
```

### Hooks for the rest of the page

- `data-state="idle | trickle | active | done"` on the bar element, plus `data-error` during the `done` phase of a load that failed.
- `data-sp-busy` on `<html>` while a bar is visible. With several bars it stays until the last one goes idle; `busyAttribute={false}` opts a bar out. `ariaBusy` also sets `aria-busy="true"` there (off by default: how screen readers treat a busy root varies):

```tsx
<main class="transition-opacity [[data-sp-busy]_&]:opacity-60">…</main>
```

### Your own template

The default template is a single `<Bar />`. Compose whatever you need. Children can read the controller with `useProgress()`:

```tsx
import { Bar, useProgress } from 'solid-route-progress'

;<RouteProgress>
  <Bar class="rounded-r-full" />
  <Percent />
</RouteProgress>

const Percent = () => <output>{Math.round(useProgress().value() * 100)}%</output>
```

`--sp-value` is registered as a `<number>`, so an element of your own can transition it, e.g. a ring. Keep the `var()` fallbacks: without them the declarations are invalid unless you set those properties yourself.

```css
.ring {
  background: conic-gradient(
    var(--sp-color, oklch(0.65 0.14 241)) calc(var(--sp-value) * 1turn),
    transparent 0
  );
  transition: --sp-value var(--sp-trickle-duration, 10s) var(--sp-trickle-easing, ease-out);
}
```

### Recipes: NProgress' glow and spinner, a failed load

None of these ships in `style.css`; paste the one you want.

```css
/* a failed load: `data-error` is set while the bar completes */
.sprogress[data-error] {
  --sp-color: oklch(0.63 0.19 23);
}

/* the glow "peg" at the leading edge */
.sprogress-bar::after {
  content: '';
  position: absolute;
  inset-inline-end: 0;
  width: 100px;
  height: 100%;
  box-shadow:
    0 0 10px var(--sp-color, oklch(0.65 0.14 241)),
    0 0 5px var(--sp-color, oklch(0.65 0.14 241));
  transform: rotate(3deg) translateY(-4px);
}
.sprogress:dir(rtl) .sprogress-bar::after {
  transform: rotate(-3deg) translateY(-4px);
}

/* a spinner in the inline-end corner: <div class="spinner" aria-hidden="true" /> next to <Bar /> */
.spinner {
  position: absolute;
  top: 15px;
  inset-inline-end: 15px;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-block-start-color: var(--sp-color, oklch(0.65 0.14 241));
  border-inline-start-color: var(--sp-color, oklch(0.65 0.14 241));
  border-radius: 50%;
  animation: spin 400ms linear infinite;
}
.sprogress[data-state='idle'] .spinner {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  .spinner {
    display: none;
  }
}
@keyframes spin {
  to {
    rotate: 1turn;
  }
}
```

## Behavior options

All props of `<RouteProgress>` (and `<Progress>` / `createProgress()`):

| Prop            | Default   | Description                                                                              |
| --------------- | --------- | ---------------------------------------------------------------------------------------- |
| `trickleTo`     | `0.95`    | value the bar drifts toward while loading                                                |
| `delay`         | `200`     | ms before the bar shows; faster loads never show it                                      |
| `stopDelay`     | `0`       | ms to wait before completing                                                             |
| `speed`         | `200`     | ms for hops/fades (written to `--sp-speed`)                                              |
| `label`         | `Loading` | accessible name                                                                          |
| `getValueLabel` | none      | `(percent) => string` for `aria-valuetext` when the value is known (not while trickling) |
| `busyAttribute` | `true`    | toggle `data-sp-busy` on `<html>`                                                        |
| `ariaBusy`      | `false`   | also toggle `aria-busy="true"` on `<html>`                                               |
| `controller`    | none      | drive the bar from a controller you own                                                  |

Options belong to whoever creates the controller. Inside `<ProgressProvider>` put them on the provider: a bar that picks up a provided controller (or a `controller` prop) has nothing to apply them to, and says so in development. Development builds (solid-js's `development` export condition) also warn when `style.css` is not loaded.

Router-specific:

| Prop            | Default | Description                                                                                                                                                                                                                                                                                           |
| --------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shallow`       | `false` | skip navigations that only change the search string or hash                                                                                                                                                                                                                                           |
| `filter`        | none    | `(to, from) => boolean`; return `false` to skip a navigation                                                                                                                                                                                                                                          |
| `crossDocument` | `true`  | also show the bar when the page leaves the document (external links, plain form posts, `location.reload()`). Needs the Navigation API; browser-UI navigations (reload button, address bar) never reach the page. Pass `{ timeout, filter }` to tune the 10 s safety net or skip navigations by event. |

A navigation that leaves the document but is canceled (a stop, a newer navigation) or comes back from the back/forward cache fades the bar out instead of running it to 100%. One a router intercepts completes on `navigatesuccess` / `navigateerror`; the timeout stops applying once it commits. `navigate` events another listener canceled are skipped.

Mark any link (or a whole nav) with `data-sp-ignore` to keep the bar hidden for it. This works for `<A>`, plain anchors, and Navigation API navigations alike (plain anchors rely on `NavigateEvent.sourceElement`: Chrome 135, Firefox 147, Safari 26.2).

## Manual control

Wrap the app in `<ProgressProvider>`; `<RouteProgress>` then drives the provider's controller and `useProgress()` reaches it from anywhere, which is handy for fetches, uploads, or anything else:

```tsx
import { ProgressProvider, useProgress } from 'solid-route-progress'

const Layout = (props) => (
  <ProgressProvider delay={300}>
    <RouteProgress />
    <Suspense>{props.children}</Suspense>
  </ProgressProvider>
)

// anywhere below
const progress = useProgress()

const release = progress.start() // hold the bar open: show (after `delay`) + trickle
progress.set(0.6) // hop to 60%, then keep trickling (ignored while `delay` is still pending)
release() // let go; the bar completes once every hold is released
// or: release('error') — completes with `data-error`; release('cancel') — fades out without reaching 100%

progress.track(fetch('/api/items')) // hold until the promise settles; a rejection is an 'error'
progress.track(upload(file), { timeout: 30_000 }) // let go after 30 s even if it never settles
progress.done() // complete now, dropping every hold (also takes an outcome)

{
  using hold = progress.start() // where `Symbol.dispose` exists, a release is also a disposable
  await work()
} // released here, even on throw

progress.value() // Accessor<number>  — target value
progress.state() // Accessor<'idle' | 'trickle' | 'active' | 'done'>
progress.active() // Accessor<boolean>
progress.error() // Accessor<boolean> — true during the done phase of a failed load
```

Every source holds the bar separately: `<RouteProgress>`, cross-document navigations, and each `track()`. A route that finishes first therefore never cuts a tracked fetch short. `done()` overrides them all and ends every hold. An `'error'` from any hold wins when the last one lets go; `'cancel'` only fades the bar out when nothing failed. A load that settles before the bar shows (within `delay`, or before the first frame) draws nothing, failed or not.

Or create your own with `createProgress(options)` and render it with `<Progress controller={…} />`, which works without a router.

## Without `@solidjs/router`: the Navigation API

`solid-route-progress/navigation` drives the bar from the browser's [Navigation API](https://developer.mozilla.org/docs/Web/API/Navigation_API) (Baseline since January 2026). It starts on `navigate` and completes once the navigation settles: on `navigatesuccess` or `navigateerror` for navigations a router intercepts, or right away for a plain `pushState` nobody intercepts (over before it paints, so nothing shows). An intercepted navigation starts as a `navigate` event whose `destination.sameDocument` is `false` (it only becomes same-document once intercepted), so it is held like a cross-document one, and the safety timeout stops applying once it commits. A `navigateerror` from an abort (a stop, a newer navigation) fades the bar out. Any other `navigateerror`, such as a rejected intercept handler, completes it as an `'error'`. Cross-document navigations are covered exactly as with the router integration. Where the API is missing, nothing is tracked (development builds say so).

Routers that don't intercept through the Navigation API (including `@solidjs/router`) load their data outside of it, so their loads are invisible here. Use `solid-route-progress/router` for those.

```tsx
import { NavigationProgress } from 'solid-route-progress/navigation'

;<NavigationProgress filter={(e) => e.navigationType !== 'replace'} />
```

## Coming from NProgress / BProgress

| There                                            | Here                                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `minimum`                                        | `--sp-start`                                                                                                          |
| `trickleSpeed`, `easing`, `speed`                | `--sp-trickle-duration`, `--sp-trickle-easing`, `speed` / `--sp-speed`                                                |
| `trickle: false`                                 | `trickleTo` equal to `--sp-start`: the bar reveals and waits for `set()` / `done()`                                   |
| `color`, `height`, `template`                    | `--sp-color`, `--sp-height`, children                                                                                 |
| `showSpinner`, `spinnerPosition`                 | the spinner recipe, placed with your own `top` / `inset-inline-end`                                                   |
| `parent`                                         | render the bar inside the container, `class="absolute"`                                                               |
| `direction: 'rtl'`                               | automatic under `dir="rtl"`                                                                                           |
| `startPosition`, `delay`, `stopDelay`            | `set(n)`, `delay` (default 200 ms), `stopDelay`                                                                       |
| `shallowRouting`, `targetPreprocessor`           | `shallow`, `filter(to, from)`                                                                                         |
| `disableSameURL`                                 | built in: navigations the router drops never show a bar                                                               |
| `data-disable-progress`, `data-prevent-progress` | `data-sp-ignore`                                                                                                      |
| `promise()`                                      | `track(promise)`; `start()` returns its own release                                                                   |
| `inc()`, `dec()`, `pause()`, `resume()`          | none: the drift is a CSS transition, so JS holds no current position to step or freeze. Stepwise loads: `set(k / n)`. |
| `indeterminate`                                  | none: trickling already reads as indeterminate to assistive tech; style `data-state="trickle"` as you like            |
| `nonce`, `style`, `disableStyle`, `memo`         | not needed: styles are a stylesheet you import, components are plain Solid                                            |

## API surface

```ts
// solid-route-progress
createProgress(options?): ProgressController // { start(): Release, done(outcome?), set, track(promise, { timeout? }), value, state, active, error, options }
type Release = (outcome?: 'error' | 'cancel') => void // & Disposable where Symbol.dispose exists
// types: Release, Outcome, TrackOptions, DisposableLike, ProgressController, ProgressOptions, ProgressState
<Progress>, <ProgressProvider>, <Bar>, useProgress(), ProgressContext
createCrossDocumentProgress(controller, { timeout?, filter? })
IGNORE_ATTRIBUTE // 'data-sp-ignore'

// solid-route-progress/router
<RouteProgress>, createRouteProgress(controller, { shallow?, filter?, crossDocument? })

// solid-route-progress/navigation
<NavigationProgress>, createNavigationProgress(controller, { filter?, timeout? })
```

## How it works

1. `start()` waits `delay` (200 ms), then flips `data-state` to `trickle` and sets `--sp-value` to `trickleTo` (0.95). The stylesheet's `trickle` rule has a 10 s transition on `transform` whose curve races out and then crawls. It is one transition, and no timer steps it.
2. `set(n)` switches to the `active` rule (short `--sp-speed` transition) for the hop, then hands back to `trickle`. CSS transitions interrupt from the _current_ animated value, so there is nothing to sync.
3. Once the last hold is released (or on `done()`), the bar moves to 100% under the `done` rule (with `data-error` if a hold was released as an `'error'`; a `'cancel'` skips this step and fades straight out), then `idle` fades the whole bar out with `opacity` + a delayed `visibility: hidden`. The bar itself is parked back at `--sp-start` only after the fade has finished. Both steps take `speed`, which the bar also writes to `--sp-speed`, so the CSS and the timers never disagree.
4. If the load ends while `delay` is still pending, or before the browser painted the bar (tracked with a single `requestAnimationFrame`), the bar is dropped silently.

## Development

```sh
pnpm install
pnpm dev        # Vite + Tailwind v4 playground at http://localhost:5199 (and /navigation.html)
pnpm dev:www    # landing page + docs (SolidStart, MDX) at http://localhost:5200
pnpm lint       # oxlint, with eslint-plugin-solid loaded as a JS plugin
pnpm format:check
pnpm test       # Vitest: jsdom, SSR, and real Chromium, Firefox and WebKit
                # (once: pnpm exec playwright install chromium firefox webkit)
pnpm typecheck  # the whole repo, plus the published entries under isolatedDeclarations
pnpm build      # tsdown → dist/*.js (DOM), dist/*.jsx (`solid` condition), d.ts, style.css
pnpm size       # minified gzip/brotli budget, incl. `createProgress` tree-shaken on its own
pnpm check      # lint, typecheck, test, build, size
pnpm changeset  # describe a change for the next release's notes
```

CI runs `pnpm format:check`, `pnpm check` and the docs build on every push and pull request. Releases go through changesets with npm trusted publishing (provenance included); see [Releasing](CONTRIBUTING.md#releasing).

The package ships JSX untouched under the `solid` export condition, so SolidStart / `vite-plugin-solid` compile it for DOM or SSR as appropriate, plus a DOM-compiled build for everyone else. That build does not render on the server, so SSR needs a bundler that resolves `solid`.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Report security issues as described in [SECURITY.md](SECURITY.md).

## License

MIT
