# Contributing

Thanks for taking the time to contribute. This guide covers what you need to set up the project and
what a pull request should include.

## Prerequisites

You need Node.js 24, which is what CI uses, and pnpm 10. The `packageManager` field in
`package.json` pins the exact pnpm version, so `corepack enable` picks it up.

```sh
pnpm install
pnpm exec playwright install chromium firefox webkit # once, for the browser tests
```

The commands for the playground, the landing page, and the individual checks are listed in the
[Development section of the README](README.md#development).

## What fits the project

The library is small on purpose, so a change has to fit these rules:

- CSS draws and JavaScript reports state. JavaScript writes `--sp-value`, `--sp-speed`, and the
  `data-*` attributes, and the motion is a CSS transition. A trickle stepped by JS timers is out of
  scope.
- Styles live in `src/style.css`, inside a cascade layer, so utilities and your own rules win
  without `!important`.
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
- When behavior changes, update `README.md` and the matching page under `www/src/routes/docs/`.
- If your change affects the published package, run `pnpm changeset` and describe it for the release
  notes. Docs-only and tooling-only changes do not need one.
