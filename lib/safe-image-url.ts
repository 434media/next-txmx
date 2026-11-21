/**
 * An image URL an admin typed or saved, kept only when it is an absolute https URL.
 *
 * The flyer field accepts a pasted URL, which is then shown in the admin preview and on the
 * public fight-night page. Anything else (javascript:, data:, a relative path, junk) becomes
 * "", so callers fall back to no image. Code scanning alert #5 (js/xss-through-dom) flagged
 * the preview's `<img src>` taking that text unchecked.
 */
export function httpsImageUrl(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 2048) return ""
  try {
    const url = new URL(trimmed)
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : ""
  } catch {
    return ""
  }
}
