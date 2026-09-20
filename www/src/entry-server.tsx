import { createHandler, StartServer } from '@solidjs/start/server'

const THEME_INIT = `try{var t=localStorage.getItem('sp-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`

// The one place a colour stays hex: favicons are rasterised outside the page, without our tokens.
// #737373 is `oklch(0.556 0 0)`, the palette's mid neutral — it reads on either browser chrome.
const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="13" width="28" height="6" rx="3" fill="#737373"/></svg>`,
  )

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Web-native, CSS-driven route progress bar for SolidJS. The loading drift is one CSS transition, themeable from any stylesheet."
          />
          <link rel="icon" href={FAVICON} />
          {/* Pretendard is bundled (`app.css` imports the package), so no font CDN. */}
          {/* eslint-disable-next-line solid/no-innerhtml -- a static constant, no user input */}
          <script innerHTML={THEME_INIT} />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
