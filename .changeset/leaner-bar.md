---
'solid-route-progress': minor
---

A leaner bar. `<RouteProgress />` now adds 2363 B min+gzip after tree-shaking (was 2410), `<NavigationProgress />` 2099 B (was 2193), and `style.css` 510 B (was 534).

- The bar slides with the `translate` property instead of `transform`, so `transform` on `.sprogress-bar` is free for your own effects, such as a skew. Its transitions still run on the compositor. If you overrode the bar's `transition` naming `transform`, name `translate` instead.
- The stylesheet holds the short `--sp-speed` hop as the bar's default transition and only the `trickle` state switches to the long drift, so it needs fewer rules. The idle fade only overrides the delays.
- `<html data-sp-busy>` and `aria-busy` are written only when the first bar shows and the last one hides; moves within a load, such as `set()`, no longer rewrite them.
- The default template renders a static element instead of mounting `<Bar />`, so a bar without children mounts no component, spread, or effect for it.
- `<NavigationProgress>` listens with one set of Navigation API listeners instead of two. Behavior is unchanged.
