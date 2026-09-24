# solid-route-progress with SolidStart

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/kecan0406/solid-route-progress/tree/main/examples/solidstart?file=src/app.tsx)

A SolidStart app with a bar themed through Tailwind CSS v4, in the landing page's colors. Its routes load slowly on purpose: follow the links and watch the top edge.

Every line that sets up the bar is marked ★ in the code; the rest is an ordinary SolidStart app.

| Step | File                   | What it does                                                            |
| ---- | ---------------------- | ----------------------------------------------------------------------- |
| ★ 1  | `src/app.css`          | imports the stylesheet once, after Tailwind                             |
| ★ 2  | `src/app.css`          | colors the bar from `@theme` tokens, light and dark                     |
| ★ 3  | `src/app.tsx`          | `<ProgressProvider>` shares one controller with the whole app           |
| ★ 4  | `src/app.tsx`          | `<RouteProgress />` in the router root; `data-error:` turns it red      |
| ★ 5  | `src/app.tsx`          | dims `<main>` while `<html data-sp-busy>` is set                        |
| ★ 6  | `src/routes/index.tsx` | `useProgress().track()` holds the bar for work that is not a navigation |

`src/lib/albums.ts` holds the slow queries the routes wait on. The bar covers them with nothing more than ★ 4.

```sh
npx degit kecan0406/solid-route-progress/examples/solidstart my-app
cd my-app
npm install
npm run dev
```
