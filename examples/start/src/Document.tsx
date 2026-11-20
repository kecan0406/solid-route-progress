import { HydrationScript } from '@solidjs/web'
import type { ParentProps } from 'solid-js'

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>solid-route-progress · Start mode</title>
        <HydrationScript />
      </head>
      <body class="bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {props.children}
      </body>
    </html>
  )
}
