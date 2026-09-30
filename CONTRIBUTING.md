# Contributing

Thanks for taking the time to contribute. This guide covers what you need to set up the project and
what a pull request should include. To add your site to the showcase, skip to
[Add a site to the showcase](#add-a-site-to-the-showcase): it takes one small file and no setup.

## Prerequisites

You need Node.js 24, which is what CI uses (`.node-version` holds it, for version managers and the
workflows alike), and pnpm 10. The `packageManager` field in `package.json` pins the exact pnpm
version, so `corepack enable` picks it up.

```sh
pnpm install
pnpm exec playwright install chromium firefox webkit # once, for the browser tests
```

## Commands

```sh
pnpm dev        # Vite + Tailwind v4 playground at http://localhost:5199 (and /navigation.html)
pnpm dev:www    # landing page + docs (SolidStart, MDX) at http://localhost:5200
pnpm lint       # oxlint, with eslint-plugin-solid loaded as a JS plugin
pnpm format:check
pnpm test       # Vitest: jsdom, SSR, and real Chromium, Firefox and WebKit
                # (once: pnpm exec playwright install chromium firefox webkit)
pnpm typecheck  # the whole repo, plus the published entries under isolatedDeclarations
pnpm build      # tsdown → dist/*.js (DOM), dist/*.jsx (`solid` condition), d.ts, style.css, docs/*.md
pnpm size       # minified gzip/brotli budget, incl. `createProgress`, `<RouteProgress>` and
                # `<NavigationProgress>` each tree-shaken on its own
pnpm check      # lint, typecheck, test, build, size
pnpm changeset  # describe a change for the next release's notes
```

The package ships JSX untouched under the `solid` export condition, so SolidStart and
`vite-plugin-solid` compile it for DOM or SSR, plus a DOM-compiled build for everyone else.

## What fits the project

The library is small on purpose, so a change has to fit these rules:

- CSS draws and JavaScript reports state. JavaScript writes `--sp-value`, `--sp-speed`, and the
  `data-*` attributes, and the motion is a CSS transition. A trickle stepped by JS timers is out of
  scope.
- Styles live in `src/style.css`, inside a cascade layer, so utilities and your own rules win
  without `!important`.
- `src/engine/` stays framework-free: the state machine and the Navigation API listeners take
  their reactive primitives, the server flag, and an `AbortSignal` as arguments, and lint rejects
  Solid imports there. The files at the root of `src/` bind them to Solid.
- The default template stays a single bar. A spinner and an indeterminate mode are documented as
  recipes instead.
- The size budget is enforced per entry point by `pnpm size`. A change that goes over it needs a
  reason in the pull request.

For anything larger than a bug fix, please open an issue first so we can agree on the approach.

## Before you open a pull request

Run the same checks CI runs:

```sh
pnpm format:check
pnpm check
```

`pnpm check` runs lint, typecheck, tests, build, and the size budget. CI also builds the landing
page with `pnpm build:www`.

- Add or update tests in `test/` for the behavior you change. They run in jsdom, in an SSR
  environment, and in real Chromium, Firefox, and WebKit.
- When behavior changes, update the matching page under `www/src/routes/docs/`, and `README.md` if
  it mentions that behavior. A new page also needs an entry in `www/src/docs.ts`, which feeds the
  sidebar and `llms.txt`.
- If your change affects the published package, run `pnpm changeset` and describe it for the release
  notes. Docs-only and tooling-only changes do not need one.

## Add a site to the showcase

The [showcase](https://solid-route-progress.vercel.app/showcase) lists sites that run
solid-route-progress in production. Each site is one JSON file in `www/showcase/`:

```json
{
  "name": "hackers.pub",
  "url": "https://hackers.pub/",
  "description": "ActivityPub-enabled social network for hackers."
}
```

`image` is optional: a mark shown left of the name, as a file in `www/public/img/showcase/`
referenced as `/img/showcase/<file>`. You do not have to add it yourself. Drop your logo (SVG or PNG)
in a comment on your pull request, or in the showcase issue form, and say where it comes from and
under which license. We commit the file, note the license in the `README.md` next to it, and add a
`credit` (the maker and the license, each with a link) that the card shows under the site.

The quickest way needs no clone:
[add the file on GitHub](https://github.com/kecan0406/solid-route-progress/new/main?filename=www%2Fshowcase%2Fmy-site.json&value=%7B%0A++%2F%2F+Delete+the+%2F%2F+lines+before+you+propose+the+change.%0A++%2F%2F+The+site%27s+domain+or+name.%0A++%22name%22%3A+%22%22%2C%0A++%2F%2F+Starting+with+https%3A%2F%2F%0A++%22url%22%3A+%22https%3A%2F%2F%22%2C%0A++%2F%2F+One+line+on+what+the+site+is.%0A++%22description%22%3A+%22%22%0A++%2F%2F+Optional+logo%3A+drop+the+file+in+a+comment+on+your+pull+request%2C+and+we+add+these.%0A++%2F%2F+%22image%22%3A+%22%2Fimg%2Fshowcase%2Fyour-site.svg%22%2C%0A++%2F%2F+%22credit%22%3A+%7B%0A++%2F%2F+++%22text%22%3A+%22Logo+by+Jane+Doe%22%2C%0A++%2F%2F+++%22url%22%3A+%22https%3A%2F%2Fexample.com%2Fjane%22%2C%0A++%2F%2F+++%22license%22%3A+%22CC+BY+4.0%22%2C%0A++%2F%2F+++%22licenseUrl%22%3A+%22https%3A%2F%2Fcreativecommons.org%2Flicenses%2Fby%2F4.0%2F%22%0A++%2F%2F+%7D%0A%7D%0A),
fill in the three fields, and propose the change. GitHub forks the repository and opens the pull
request for you. If you would rather fill in a form, use the
[showcase issue](https://github.com/kecan0406/solid-route-progress/issues/new?template=showcase.yml)
instead.

CI builds the site, and the build fails with the file and the field if an entry does not fit. A
showcase entry needs no tests, docs, or changeset.

## Releasing

Releases are automated with changesets and npm trusted publishing, so nobody publishes from a
laptop.

1. A pull request that changes the published package carries a changeset (`pnpm changeset`).
2. Once it lands on `main`, the Release workflow opens or updates a "chore: version packages" pull
   request. That pull request bumps the version and writes `CHANGELOG.md`, with links to the pull
   requests behind each entry.
3. Merging it publishes to npm, pushes the `solid-route-progress@x.y.z` tag, and creates the GitHub
   Release.

If the publish job fails with `ENEEDAUTH`, check that npm still lists the trusted publisher with
`npx -y npm@latest trust list solid-route-progress` (it needs a 2FA confirmation). The workflow file
must be `release.yml` in `kecan0406/solid-route-progress`.

As a last resort, publish by hand from an up-to-date `main`. Run `npm login` and `npm publish`; its
`prepublishOnly` step builds the package, which also runs publint and the type checks, and enforces
the size budget. Then create the tag and Release with
`gh release create solid-route-progress@x.y.z --title solid-route-progress@x.y.z --notes-file <notes>`.
