// Renders `public/og.png`, the 1200×630 link preview, in headless Chromium.
// Run from the repo root after changing the copy: `node www/scripts/og.mjs`
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const font = readFileSync(
  new URL(
    '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
    import.meta.url,
  ),
).toString('base64')

// The site's dark palette, with the bar in the stylesheet's default color.
const html = /* html */ `<!doctype html>
<style>
  @font-face { font-family: Pretendard; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 45 920; }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: oklch(0.145 0 0); color: oklch(0.985 0 0);
    font-family: Pretendard, sans-serif; padding: 88px 96px 40px;
    display: flex; flex-direction: column;
  }
  .bar { position: absolute; inset: 0 auto auto 0; height: 10px; width: 72%; background: oklch(0.65 0.14 241);
    box-shadow: 0 0 24px oklch(0.65 0.14 241 / 0.7); border-radius: 0 5px 5px 0; }
  .mark { display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 600; letter-spacing: -0.02em; }
  .mark i { width: 44px; height: 9px; border-radius: 5px; background: currentColor; }
  h1 { margin-top: auto; font-size: 90px; line-height: 1; font-weight: 650; letter-spacing: -0.045em; }
  p { margin-top: 28px; font-size: 32px; color: oklch(0.708 0 0); letter-spacing: -0.01em; }
  code { margin: 44px 0 auto; align-self: flex-start; font: 500 26px ui-monospace, Menlo, monospace;
    padding: 14px 22px; border: 2px solid oklch(0.269 0 0); border-radius: 14px; }
  code span { color: oklch(0.556 0 0); margin-right: 14px; }
</style>
<div class="bar"></div>
<div class="mark"><i></i>solid-route-progress</div>
<h1>Progress, drawn in CSS.</h1>
<p>A route progress bar for SolidJS. The loading drift is one CSS transition.</p>
<code><span>$</span>npm i solid-route-progress</code>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname })
await browser.close()
