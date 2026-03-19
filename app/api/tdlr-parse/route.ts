import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  let pdfBuffer: Buffer

  try {
    if (contentType.includes('application/pdf')) {
      const arrayBuffer = await request.arrayBuffer()
      pdfBuffer = Buffer.from(arrayBuffer)
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('pdf') as File | null
      if (!file) {
        return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
      }
      const arrayBuffer = await file.arrayBuffer()
      pdfBuffer = Buffer.from(arrayBuffer)
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 })
  }

  if (pdfBuffer.length === 0) {
    return NextResponse.json({ error: 'Empty PDF file' }, { status: 400 })
  }

  if (pdfBuffer.length > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

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
      return NextResponse.json({ error: parsed.error }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (error: unknown) {
    console.error('TDLR parse error:', error)

    // execSync attaches stdout/stderr to the error object on non-zero exit
    const execError = error as { stdout?: string; stderr?: string; message?: string }
    if (execError.stdout) {
      try {
        const parsed = JSON.parse(execError.stdout)
        if (parsed.error) {
          return NextResponse.json({ error: parsed.error }, { status: 500 })
        }
      } catch {
        // stdout wasn't valid JSON
      }
    }

    const detail = execError.stderr?.trim() || execError.message || 'Failed to parse PDF'
    return NextResponse.json({ error: detail }, { status: 500 })
  } finally {
    try {
      unlinkSync(tmpPath)
    } catch {
      // ignore cleanup errors
    }
  }
}
