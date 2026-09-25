---
'solid-route-progress': patch
---

Trim the bundle. The error `useProgress()` throws outside a controller keeps its full guidance in development and is shorter in production. `style.css` drops its `cubic-bezier()` fallback for the trickle curve: browsers without `linear()` (Safari before 17.2) now drift with `ease` instead.
