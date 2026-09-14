// Header-injection and encoding tests for the gallery download filename.
// Run: pnpm test          (node --test, no test framework needed)
//
// The file name reaching contentDisposition() comes from Google Drive, so it
// is attacker-influenceable by anyone who can add a file to the shared drive.
// These assert the two failure modes that matter: breaking out of the quoted
// `filename` to inject header directives, and emitting an invalid RFC 8187
// ext-value in `filename*`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contentDisposition, encodeExtValue } from '../lib/content-disposition.mjs'

// `'` delimits the ext-value's charset and language fields, so it must never
// appear raw in the encoded output.
const EXT_DELIM = "filename*=UTF-8''"
const ATTR_CHAR = /[A-Za-z0-9!#$&+\-.^_`|~]/

const extValueOf = (header) => {
  const i = header.indexOf(EXT_DELIM)
  assert.notEqual(i, -1, `header has no ${EXT_DELIM} field: ${header}`)
  return header.slice(i + EXT_DELIM.length)
}

const HOSTILE_NAMES = [
  ['quote break-out', 'evil.jpg"; filename="pwned.exe'],
  ['CRLF injection', 'a\r\nSet-Cookie: sess=1'],
  ['bare LF', 'a\nX-Injected: 1'],
  ['semicolon', 'sem;icolon.jpg'],
  ['apostrophe', "Jesse's photo.jpg"],
  ['parens and star', 'Photo (Final)*.jpg'],
  ['backslash', 'back\\slash.jpg'],
  ['accented', 'café-ñ-photo.jpg'],
  ['emoji', 'champion 🥊.jpg'],
  ['CJK', '写真.jpg'],
  ['lone surrogate', 'bad\uD800.jpg'],
  ['very long', `${'A'.repeat(400)}.jpg`],
  ['empty', ''],
  ['null', null],
  ['undefined', undefined],
]

for (const [label, input] of HOSTILE_NAMES) {
  test(`contentDisposition is well-formed: ${label}`, () => {
    const header = contentDisposition(input, 'FILEID')

    assert.doesNotMatch(header, /[\r\n]/, 'header must stay on one line')
    assert.equal(
      (header.match(/"/g) || []).length,
      2,
      'quoted filename must not be closed early'
    )
    assert.equal(header.split(';').length, 3, 'unexpected directive count')
    assert.ok(header.startsWith('attachment; filename="'), 'must be an attachment')
    assert.ok(header.length < 600, `header too long: ${header.length}`)

    // Every byte left unencoded in the ext-value must be a valid attr-char.
    for (const ch of extValueOf(header).replace(/%[0-9A-F]{2}/g, '')) {
      assert.ok(ATTR_CHAR.test(ch), `raw non-attr-char ${JSON.stringify(ch)} in ext-value`)
    }
  })
}

test('encodeExtValue escapes what encodeURIComponent leaves raw', () => {
  // These four are the gap that made encodeURIComponent unsafe here.
  assert.equal(encodeExtValue("'"), '%27')
  assert.equal(encodeExtValue('('), '%28')
  assert.equal(encodeExtValue(')'), '%29')
  assert.equal(encodeExtValue('*'), '%2A')
})

test('encodeExtValue round-trips multi-byte characters', () => {
  assert.equal(encodeExtValue('café'), 'caf%C3%A9')
  assert.equal(decodeURIComponent(encodeExtValue('写真 🥊')), '写真 🥊')
})

test('encodeExtValue does not throw on a lone surrogate', () => {
  assert.equal(encodeExtValue('\uD800'), '%EF%BF%BD') // replaced with U+FFFD
})

test('encodeExtValue leaves attr-chars untouched', () => {
  assert.equal(encodeExtValue('photo-01_final.JPG'), 'photo-01_final.JPG')
})

test('a normal Drive name survives intact', () => {
  assert.equal(
    contentDisposition('DSC01495.jpg', 'FILEID'),
    `attachment; filename="rise-of-a-champion-DSC01495.jpg"; ${EXT_DELIM}rise-of-a-champion-DSC01495.jpg`
  )
})

test('a missing name falls back to the file id', () => {
  assert.match(contentDisposition(null, 'abc123'), /rise-of-a-champion-abc123\.jpg/)
})
