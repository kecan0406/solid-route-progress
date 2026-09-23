import { Link, Meta, Title } from '@solidjs/meta'

/**
 * The per-page head: title, description, canonical URL and their Open Graph twins. Render it once
 * per route; `@solidjs/meta` keys `<meta>` by content, so a second description would not replace
 * the first. The site-wide Open Graph tags (image, card type) live in `entry-server.tsx`.
 */
export function PageMeta(props: { title: string; description: string; path: string }) {
  const url = () => `${__SP_SITE__}${props.path}`
  return (
    <>
      <Title>{props.title}</Title>
      <Meta name="description" content={props.description} />
      <Meta property="og:title" content={props.title} />
      <Meta property="og:description" content={props.description} />
      <Meta property="og:url" content={url()} />
      <Link rel="canonical" href={url()} />
    </>
  )
}
