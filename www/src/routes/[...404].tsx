import { Meta, Title } from '@solidjs/meta'
import { httpStatus } from '@solidjs/web'
import { Header } from '~/components/Header'

export default function NotFound() {
  httpStatus(404)

  return (
    <div class="mx-auto max-w-[1100px] px-5 md:px-10">
      <Title>Not found · solid-route-progress</Title>
      <Meta name="robots" content="noindex" />
      <Header />
      <main class="py-24 text-center">
        <p class="mb-3 font-mono text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          404
        </p>
        <h1 class="mb-6 text-[32px] font-semibold tracking-tight">This page does not exist.</h1>
        <p class="flex justify-center gap-4 text-[14px]">
          <a href="/" class="underline underline-offset-4">
            Home
          </a>
          <a href="/docs" class="underline underline-offset-4">
            Docs
          </a>
        </p>
      </main>
    </div>
  )
}
