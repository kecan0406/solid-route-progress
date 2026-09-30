/** Injected by `vite.config.ts` from the root `package.json`. */
declare const __SP_VERSION__: string
declare const __SP_REPO__: string
declare const __SP_SITE__: string

declare module 'virtual:showcase' {
  /** The sites in `showcase/*.json`, checked and ordered by file name. See `showcase.ts`. */
  const entries: import('./showcase').ShowcaseEntry[]
  export default entries
}

declare module 'virtual:llms' {
  /** `/llms.txt`, `/llms-full.txt` and each page's `.md` copy, by path. See `llms.ts`. */
  const files: Record<string, string>
  export default files
}
