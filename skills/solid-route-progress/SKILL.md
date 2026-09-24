---
name: solid-route-progress
description: Adds and configures solid-route-progress, the thin loading bar along the top of the page for SolidJS and SolidStart route navigations. Use when adding a route, page or navigation loading indicator to a Solid app, or when code imports solid-route-progress, RouteProgress, NavigationProgress, ProgressProvider, useProgress or createProgress.
license: MIT
---

# solid-route-progress

Your training data likely predates this package or covers an older version. Read the docs of the installed version before writing code:

1. `node_modules/solid-route-progress/dist/docs/README.md` (index, one Markdown file per page)
2. Otherwise https://solid-route-progress.vercel.app/llms.txt, where every page is also served as `.md`

If an API is in neither, it does not exist. Say so instead of guessing.

## Setup

```sh
npm i solid-route-progress
```

Import the stylesheet once, from the app's global CSS or its entry:

```css
@import 'solid-route-progress/style.css';
```

Then pick one entry by how the app navigates:

| The app uses                            | Render                                                | Import from                       |
| --------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| `@solidjs/router`, including SolidStart | `<RouteProgress />` once, in the router's root layout | `solid-route-progress/router`     |
| no router (MPA, plain links)            | `<NavigationProgress />` once, in the layout          | `solid-route-progress/navigation` |
| loads that are not navigations          | `<ProgressProvider>` + `useProgress()`                | `solid-route-progress`            |

SolidStart (`src/app.tsx`):

```tsx
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { RouteProgress } from 'solid-route-progress/router'
import './app.css' // holds the @import above

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

`<NavigationProgress>` needs the Navigation API (Chrome and Edge 102, Firefox 147, Safari 26.2); elsewhere it renders a bar that never shows.

Covering fetches and other work with the same bar:

```tsx
import { ProgressProvider, useProgress } from 'solid-route-progress'

// around the router's root content: <ProgressProvider><RouteProgress />…</ProgressProvider>
const progress = useProgress()
await progress.track(fetch('/api/items')) // holds the bar until the promise settles
const release = progress.start() // or hold it by hand
release() // release('error') marks a failed load, release('cancel') fades out
```

## Rules

- Do not write your own trickle: no `setInterval`, no JS-animated width. The drift toward completion is one CSS transition, and JavaScript only writes `--sp-value` and `data-state`.
- Render one bar, in the root layout. Not in each page.
- `<RouteProgress>` must be under `<Router>`: inside the `root` component, not beside `<Router>` in `app.tsx`.
- Theme with custom properties, not props or `!important`:

  ```css
  :root {
    --sp-color: oklch(0.62 0.19 264); /* or var(--color-indigo-500) */
    --sp-height: 2px;
  }
  ```

  Tailwind utilities on `class` win too, because the stylesheet sits in a cascade layer: `<RouteProgress class="h-1" />`.

- Options (`delay`, `speed`, `trickleTo`, `stopDelay`) belong where the controller is created. Under a `<ProgressProvider>`, set them on the provider; on the bar they are ignored with a dev warning.
- `useProgress()` throws outside `<ProgressProvider>`, `<Progress>`, `<RouteProgress>` or `<NavigationProgress>`.
- A load shorter than `delay` (200 ms) draws nothing on purpose. To see the bar while testing, throttle the network or pass `delay={0}`.
- Actions that only revalidate (no redirect) do not route, so they show no bar. Hold it with `useSubmission(action).pending` and `progress.start()`; the router docs have the snippet.
- Skip a link with `data-sp-ignore`; skip navigations with `shallow` or `filter={(to, from) => boolean}`.

## Not in this package

These come from other progress bar libraries. Map them instead of inventing them:

| Expected                            | Here                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `configure()`, a global instance    | options on `<RouteProgress>` / `<ProgressProvider>` / `createProgress()` |
| `color`, `height` props             | `--sp-color`, `--sp-height`                                              |
| `minimum`, `trickleSpeed`, `easing` | `--sp-start`, `--sp-trickle-duration`, `--sp-trickle-easing`             |
| `inc()`, `dec()`, `pause()`         | none; step with `set(k / n)`                                             |
| `showSpinner`, `template`           | the spinner recipe in the styling docs; custom markup as children        |
| `done(true)` to force               | `done()` completes and drops every hold                                  |

## Check the result

- The dev console shows no `[sprogress]` warnings. Each one ends with a docs link that explains the fix.
- With network throttling, a navigation shows the bar, and `<html>` carries `data-sp-busy` while it is visible.
- Server rendering needs a bundler that resolves the `solid` export condition. SolidStart and `vite-plugin-solid` do.
