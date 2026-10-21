---
'solid-route-progress': major
---

Support Solid 2. This version needs `solid-js` and `@solidjs/web` 2.0.0-rc.16 or later, and `@solidjs/router` 2.0.0-next.41 or later for the router integration. Apps on Solid 1 stay on `solid-route-progress@1`.

- `<RouteProgress>` follows the router's `useIsRouting()` and reads where a navigation goes from the location's in-flight value, instead of listening with `useBeforeLeave()`. Apps that never block a navigation no longer bundle the router's leave guard. `shallow` and `filter` now apply to back/forward navigations too.
- The controller's accessors catch up on a microtask, the way Solid 2 signals do after a write. They are written outside any transition, so a bar started inside an `action()` shows while the action is in flight, not once its transition commits.
- `ProgressContext` is now a `Context<ProgressController | null>`, `null` outside any controller: Solid 2 reads an `undefined` context value as a missing provider.
- `class` on `<Progress>`, `<RouteProgress>`, `<NavigationProgress>` and `<Bar>` takes Solid 2's array and object forms.
