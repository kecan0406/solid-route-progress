# solid-route-progress

## 1.1.0

### Minor Changes

- [#11](https://github.com/kecan0406/solid-route-progress/pull/11) [`adcdfdf`](https://github.com/kecan0406/solid-route-progress/commit/adcdfdf3fdcd5a699403aac1128e73ae529e2aef) Thanks [@kecan0406](https://github.com/kecan0406)! - A leaner bar. `<RouteProgress />` now adds 2363 B min+gzip after tree-shaking (was 2410), `<NavigationProgress />` 2099 B (was 2193), and `style.css` 510 B (was 534).

  - The bar slides with the `translate` property instead of `transform`, so `transform` on `.sprogress-bar` is free for your own effects, such as a skew. Its transitions still run on the compositor. If you overrode the bar's `transition` naming `transform`, name `translate` instead.
  - The stylesheet holds the short `--sp-speed` hop as the bar's default transition and only the `trickle` state switches to the long drift, so it needs fewer rules. The idle fade only overrides the delays.
  - `<html data-sp-busy>` and `aria-busy` are written only when the first bar shows and the last one hides; moves within a load, such as `set()`, no longer rewrite them.
  - The default template renders a static element instead of mounting `<Bar />`, so a bar without children mounts no component, spread, or effect for it.
  - `<NavigationProgress>` listens with one set of Navigation API listeners instead of two. Behavior is unchanged.

## 1.0.6

### Patch Changes

- [`0343639`](https://github.com/kecan0406/solid-route-progress/commit/034363956d193ec109c822354c8fab71247f369e) Thanks [@kecan0406](https://github.com/kecan0406)! - Cap the `@solidjs/router` peer range at 1.x (`^0.15.0 || ^1.0.0`), matching `solid-js`: Solid 2 is not supported yet, and the docs now say so. The package also carries the `tanstack-intent` keyword, so TanStack Intent finds the agent skill it ships.

## 1.0.5

### Patch Changes

- [`83926cb`](https://github.com/kecan0406/solid-route-progress/commit/83926cbbf4455dc4a4544aa113f4c806a9ede616) Thanks [@kecan0406](https://github.com/kecan0406)! - Trim the bundle. The error `useProgress()` throws outside a controller keeps its full guidance in development and is shorter in production. `style.css` drops its `cubic-bezier()` fallback for the trickle curve: browsers without `linear()` (Safari before 17.2) now drift with `ease` instead.

## 1.0.4

### Patch Changes

- [`bdc7858`](https://github.com/kecan0406/solid-route-progress/commit/bdc78583c3792c2f852f8561244069f05eec0e07) Thanks [@kecan0406](https://github.com/kecan0406)! - Ship the docs for AI coding agents. The package now includes the docs as Markdown for the installed version in `dist/docs/`, and an agent skill in `skills/solid-route-progress/`. Development warnings end with a link to the docs section that explains the fix. Rendering `<RouteProgress>` outside `<Router>` in development now says so, instead of surfacing only the router's own error. Production behavior is unchanged.

## 1.0.3

### Patch Changes

- [`e2745a4`](https://github.com/kecan0406/solid-route-progress/commit/e2745a44842729e763de35d83c60ee78a7a45b5e) Thanks [@kecan0406](https://github.com/kecan0406)! - Refresh the README shown on npm: a shorter overview with install and usage, a map of the docs, a SolidStart example on StackBlitz, and links to `llms.txt` for AI assistants. The package keywords and the `shallow` option's doc comment are updated too; the code is unchanged.

## 1.0.2

### Patch Changes

- [#5](https://github.com/kecan0406/solid-route-progress/pull/5) [`2c7fa17`](https://github.com/kecan0406/solid-route-progress/commit/2c7fa1707b1ef500abdbc073797a57ed64803067) Thanks [@kecan0406](https://github.com/kecan0406)! - Keep the loading drift in browsers without CSS `linear()`: the bar used to jump straight to its target there, and now eases along a `cubic-bezier()` fit of the same curve. A load that starts while the previous bar completes now honors `delay` too, so a quick follow-up navigation no longer flashes the bar when `delay` is longer than `speed`. `track()` also clears its `timeout` timer once the promise settles. `ProgressController.options` is now typed `Readonly`, as it was always meant to be read only.

## 1.0.1

### Patch Changes

- [#3](https://github.com/kecan0406/solid-route-progress/pull/3) [`e1eacb9`](https://github.com/kecan0406/solid-route-progress/commit/e1eacb95db6c58bda6a9689d88bbb21130bc5479) Thanks [@kecan0406](https://github.com/kecan0406)! - Accept `@solidjs/router` 0.15 in the peer range. The router integration uses the same `useIsRouting()` and `useBeforeLeave()` behavior there, and the router tests now also run against 0.15.

## 1.0.0

### Major Changes

- Initial release.
