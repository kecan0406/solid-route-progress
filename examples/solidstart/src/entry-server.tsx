import { createHandler, StartServer } from '@solidjs/start/server'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>solid-route-progress · SolidStart</title>
          {assets}
        </head>
        <body class="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
