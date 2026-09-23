/**
 * The docs, in reading order. The sidebar, each page's `<meta name="description">`, and the
 * generated `llms.txt` and Markdown copies (`vite.config.ts`) all read this list.
 */
export const DOCS = [
  {
    group: 'Getting started',
    pages: [
      {
        href: '/docs',
        file: 'index',
        title: 'Introduction',
        description: 'Entry points, what JavaScript writes to the bar, and what each entry costs.',
      },
      {
        href: '/docs/installation',
        file: 'installation',
        title: 'Installation',
        description: 'Install the package, import the stylesheet, and check browser support.',
      },
      {
        href: '/docs/quick-start',
        file: 'quick-start',
        title: 'Quick start',
        description:
          'Add the bar to a @solidjs/router or SolidStart app, to a page without a router, or drive it yourself.',
      },
      {
        href: '/docs/styling',
        file: 'styling',
        title: 'Styling',
        description:
          'Custom properties, Tailwind utilities, state hooks, custom templates, and paste-in recipes.',
      },
    ],
  },
  {
    group: 'Examples',
    pages: [
      {
        href: '/docs/examples',
        file: 'examples',
        title: 'Examples',
        description:
          'Live demos of track(), holds, set(), custom templates, skipped navigations, and style recipes.',
      },
    ],
  },
  {
    group: 'API',
    pages: [
      {
        href: '/docs/controller',
        file: 'controller',
        title: 'Controller',
        description:
          'createProgress() options, start(), done(), set(), track(), the signals, and the types.',
      },
      {
        href: '/docs/components',
        file: 'components',
        title: 'Components',
        description: '<Progress>, <ProgressProvider>, useProgress(), <Bar>, and ProgressContext.',
      },
      {
        href: '/docs/router',
        file: 'router',
        title: 'Router integration',
        description:
          '<RouteProgress> for @solidjs/router: ignored links, cross-document navigations, and actions.',
      },
      {
        href: '/docs/navigation-api',
        file: 'navigation-api',
        title: 'Navigation API',
        description:
          '<NavigationProgress> drives the bar from the browser Navigation API, without a router.',
      },
    ],
  },
]

export type DocPage = (typeof DOCS)[number]['pages'][number]

export const DOC_PAGES: DocPage[] = DOCS.flatMap((group) => group.pages)

/** The Markdown copy of a page: `/docs` → `/docs.md`, `/docs/styling` → `/docs/styling.md`. */
export const markdownPath = (href: string) => `${href}.md`

/** Every install command the site offers, in the order the switcher shows them. */
export const INSTALL = [
  { manager: 'npm', command: 'npm i solid-route-progress' },
  { manager: 'pnpm', command: 'pnpm add solid-route-progress' },
  { manager: 'yarn', command: 'yarn add solid-route-progress' },
  { manager: 'bun', command: 'bun add solid-route-progress' },
]
