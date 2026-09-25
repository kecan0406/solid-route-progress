# solid-route-progress

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
