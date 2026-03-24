import { NextRequest, NextResponse } from 'next/server'
import { parseTDLRPdf } from '../../../lib/tdlr-parser'

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

  try {
    const parsed = parseTDLRPdf(pdfBuffer)
    return NextResponse.json(parsed)
  } catch (error: unknown) {
    console.error('TDLR parse error:', error)
    const detail = error instanceof Error ? error.message : 'Failed to parse PDF'
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}
