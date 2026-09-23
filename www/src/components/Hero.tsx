import { InstallCommand } from '~/components/InstallCommand'

export function Hero() {
  return (
    <section class="mx-auto max-w-[720px] pt-6 text-center">
      <p class="mb-4 font-mono text-[11px] font-medium tracking-[0.16em] text-foreground uppercase">
        Route progress for SolidJS
      </p>
      <h1 class="mb-4.5 text-[clamp(34px,5vw,52px)] leading-[1.06] font-semibold tracking-[-0.035em] text-balance">
        Progress, drawn in CSS.
      </h1>
      <p class="mx-auto mb-6.5 max-w-[52ch] text-[16px] text-muted-foreground">
        The loading drift is <em>one long CSS transition</em>. No JavaScript steps the bar forward,
        and any stylesheet can theme it.
      </p>
      <InstallCommand />
    </section>
  )
}
