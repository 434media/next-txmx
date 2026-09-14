// Content-Disposition construction for the gallery image proxy.
//
// Kept in plain ESM rather than TypeScript so that scripts/*.test.mjs can
// import the real implementation under `node --test` without a build step —
// the alternative, restating the logic in the test, lets the two drift apart,
// which for header-injection handling is exactly the failure worth avoiding.

// RFC 8187 attr-char: the only octets that may appear unencoded in a
// `filename*` ext-value. Everything else has to be percent-encoded.
const ATTR_CHAR = /[A-Za-z0-9!#$&+\-.^_`|~]/

// Header budget for the file name. Percent-encoding can triple a UTF-8 name,
// and servers and proxies drop responses with oversized headers.
const MAX_NAME_LENGTH = 120

/**
 * Percent-encode a string as an RFC 8187 ext-value.
 *
 * Deliberately not encodeURIComponent: that leaves `'`, `(`, `)` and `*` raw,
 * none of which are attr-char — and `'` is the ext-value's own delimiter, so a
 * name like `Jesse's photo.jpg` would emit a third quote and leave the charset
 * and language fields ambiguous. Encoding runs over UTF-8 bytes rather than
 * code units so multi-byte characters round-trip, and a lone surrogate becomes
 * U+FFFD instead of throwing the way encodeURIComponent does.
 *
 * @param {string} value
 * @returns {string}
 */
export function encodeExtValue(value) {
  let out = ''
  for (const byte of new TextEncoder().encode(value)) {
    out +=
      byte < 0x80 && ATTR_CHAR.test(String.fromCharCode(byte))
        ? String.fromCharCode(byte)
        : `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
  }
  return out
}

/**
 * Build a Content-Disposition that makes the browser stream the response
 * straight to disk instead of the page holding it in memory.
 *
 * The name comes from Drive, so it is untrusted, and the two forms fail
 * differently. The quoted `filename` ends at its first `"`, so a name carrying
 * a quote, `;` or CRLF could close it early and inject header directives — it
 * is reduced to a conservative ASCII subset. The `filename*` form, which
 * browsers prefer, carries the exact name and is encoded per RFC 8187 above.
 *
 * @param {string | null | undefined} driveName
 * @param {string} fileId
 * @returns {string}
 */
export function contentDisposition(driveName, fileId) {
  const name = `rise-of-a-champion-${driveName || `${fileId}.jpg`}`.slice(0, MAX_NAME_LENGTH)
  const ascii = name.replace(/[^\w.\- ]+/g, '_')
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeExtValue(name)}`
}
