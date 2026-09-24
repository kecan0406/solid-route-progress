# solid-route-progress with SolidStart

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/kecan0406/solid-route-progress/tree/main/examples/solidstart)

A SolidStart app with a bar themed through Tailwind CSS v4. Its routes load slowly on purpose.

- `src/app.tsx`: `<RouteProgress />` in the router root, turned red by the `data-error:` variant, and `<main>` dimmed while `<html data-sp-busy>` is set
- `src/app.css`: the stylesheet import and the bar's color from a `@theme` token
- `src/routes/index.tsx`: `useProgress().track()` for work that is not a navigation
- `src/lib/albums.ts`: the slow queries the routes wait on

```sh
npx degit kecan0406/solid-route-progress/examples/solidstart my-app
cd my-app
npm install
npm run dev
```
