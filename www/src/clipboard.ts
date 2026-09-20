/** Copy `text`. Resolves `true` once the browser accepted it, `false` when clipboard access is unavailable or refused. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
