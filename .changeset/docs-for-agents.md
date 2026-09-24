---
'solid-route-progress': patch
---

Ship the docs for AI coding agents. The package now includes the docs as Markdown for the installed version in `dist/docs/`, and an agent skill in `skills/solid-route-progress/`. Development warnings end with a link to the docs section that explains the fix. Rendering `<RouteProgress>` outside `<Router>` in development now says so, instead of surfacing only the router's own error. Production behavior is unchanged.
