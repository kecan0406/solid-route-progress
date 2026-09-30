import entries from 'virtual:showcase'
import { REPO } from '~/links'

/**
 * A site that runs solid-route-progress: one file in `www/showcase/`, checked at build time by
 * `showcase.ts` at the root of `www/`.
 */
export interface ShowcaseEntry {
  /** The card's heading: the site's domain or name. */
  name: string
  url: string
  description: string
  /** The site's mark, shown left of its name: a file in `www/public/img/showcase/`, as its URL. */
  image?: string
  /** Who made the image and under which license, shown on the card. Each `url` links to its source. */
  credit?: { text: string; url: string; license: string; licenseUrl: string }
}

/** Every site, ordered by file name. The landing page features the first one. */
export const SHOWCASE: ShowcaseEntry[] = entries

/**
 * What GitHub's editor opens with: an empty entry and a comment on each field. JSON has no
 * comments, so `showcase.ts` at the root of `www/` fails the build until they are deleted.
 * `CONTRIBUTING.md` and `.github/ISSUE_TEMPLATE/showcase.yml` link to the same page: keep them equal.
 */
const NEW_ENTRY = `{
  // Delete the // lines before you propose the change.
  // The site's domain or name.
  "name": "",
  // Starting with https://
  "url": "https://",
  // One line on what the site is.
  "description": ""
  // Optional logo: drop the file in a comment on your pull request, and we add these.
  // "image": "/img/showcase/your-site.svg",
  // "credit": {
  //   "text": "Logo by Jane Doe",
  //   "url": "https://example.com/jane",
  //   "license": "CC BY 4.0",
  //   "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
  // }
}
`

/**
 * GitHub's "new file" page with `NEW_ENTRY` filled in. Proposing the change there forks the
 * repository and opens the pull request, so a contributor needs no clone and no git.
 */
export const ADD_SITE = `${REPO}/new/main?${new URLSearchParams({
  filename: 'www/showcase/my-site.json',
  value: NEW_ENTRY,
})}`

/** The same entry as a form, for whoever would rather not touch a file. */
export const ADD_SITE_ISSUE = `${REPO}/issues/new?template=showcase.yml`
