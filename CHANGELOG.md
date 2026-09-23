# solid-route-progress

## 1.0.2

### Patch Changes

- [#5](https://github.com/kecan0406/solid-route-progress/pull/5) [`2c7fa17`](https://github.com/kecan0406/solid-route-progress/commit/2c7fa1707b1ef500abdbc073797a57ed64803067) Thanks [@kecan0406](https://github.com/kecan0406)! - Keep the loading drift in browsers without CSS `linear()`: the bar used to jump straight to its target there, and now eases along a `cubic-bezier()` fit of the same curve. A load that starts while the previous bar completes now honors `delay` too, so a quick follow-up navigation no longer flashes the bar when `delay` is longer than `speed`. `track()` also clears its `timeout` timer once the promise settles. `ProgressController.options` is now typed `Readonly`, as it was always meant to be read only.

## 1.0.1

### Patch Changes

- [#3](https://github.com/kecan0406/solid-route-progress/pull/3) [`e1eacb9`](https://github.com/kecan0406/solid-route-progress/commit/e1eacb95db6c58bda6a9689d88bbb21130bc5479) Thanks [@kecan0406](https://github.com/kecan0406)! - Accept `@solidjs/router` 0.15 in the peer range. The router integration uses the same `useIsRouting()` and `useBeforeLeave()` behavior there, and the router tests now also run against 0.15.

## 1.0.0

### Major Changes

- Initial release.
