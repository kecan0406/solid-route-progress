import { createHandler, StartServer } from '@solidjs/start/server'

const THEME_INIT = `try{var t=localStorage.getItem('sp-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          {/* Site-wide Open Graph; each route adds its title, description and URL (`PageMeta`). */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="solid-route-progress" />
          <meta property="og:image" content={`${__SP_SITE__}/og.png`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta
            property="og:image:alt"
            content="solid-route-progress: Progress, drawn in CSS. A blue progress bar runs across the top."
          />
          <meta name="twitter:card" content="summary_large_image" />
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
