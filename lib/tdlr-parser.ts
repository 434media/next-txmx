/**
 * TDLR (Texas Dept of Licensing and Regulation) shared types and parsing.
 *
 * The actual parsing is handled by the Python script at scripts/tdlr-extract.py
 * using pdfplumber. This module provides a direct call wrapper so routes
 * don't need to HTTP-self-call.
 */

import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

export interface TDLREvent {
  date: string
  eventNumber: string
  city: string
  promoter: string
  venue: string
  address: string
  bouts: TDLRBout[]
}

export interface TDLRFighter {
  name: string
  city: string
  state: string
  boxerId: string
  weight: number
}

export interface TDLRBout {
  boutNumber: number
  referee: string
  fighter1: TDLRFighter
  fighter2: TDLRFighter
  rounds: number
  result: string
  method: string
  scores: string[]
  weightClass: string | null
  titleFight: string | null
}

/**
 * Parse a TDLR PDF buffer by invoking the Python extraction script directly.
 * Throws on failure.
 */
export function parseTDLRPdf(pdfBuffer: Buffer): TDLREvent {
  const tmpPath = join(tmpdir(), `tdlr-${randomUUID()}.pdf`)
  writeFileSync(tmpPath, pdfBuffer)

  try {
    const scriptPath = join(process.cwd(), 'scripts', 'tdlr-extract.py')
    const result = execSync(`python3 "${scriptPath}" "${tmpPath}"`, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    })

    const parsed = JSON.parse(result)

    if (parsed.error) {
      throw new Error(parsed.error)
    }

    return parsed as TDLREvent
  } catch (error: unknown) {
    // execSync attaches stdout/stderr to the error on non-zero exit
    const execError = error as { stdout?: string; stderr?: string; message?: string }
    if (execError.stdout) {
      try {
        const parsed = JSON.parse(execError.stdout)
        if (parsed.error) throw new Error(parsed.error)
      } catch (e) {
        if (e instanceof Error && e.message !== execError.stdout) throw e
      }
    }
    const detail = execError.stderr?.trim() || execError.message || 'Failed to parse PDF'
    throw new Error(detail)
  } finally {
    try { unlinkSync(tmpPath) } catch { /* ignore cleanup */ }
  }
}
