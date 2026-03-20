import { NextRequest, NextResponse } from 'next/server'

const CSV_URL = 'https://www.tdlr.texas.gov/sports/_events-list.csv'
const BASE_URL = 'https://www.tdlr.texas.gov'

interface CSVRow {
  date: string
  promoter: string
  category: string
  location: string
  results: string
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const rows: CSVRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 5) continue
    rows.push({
      date: (cols[0] || '').trim(),
      promoter: (cols[1] || '').trim(),
      category: (cols[2] || '').trim(),
      location: (cols[3] || '').trim(),
      results: (cols[4] || '').trim(),
    })
  }
  return rows
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch the TDLR events CSV
    const csvResponse = await fetch(CSV_URL, {
      headers: { 'User-Agent': 'TXMX-Scraper/1.0' },
      next: { revalidate: 0 },
    })

    if (!csvResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch CSV: ${csvResponse.status}` },
        { status: 502 }
      )
    }

    const csvText = await csvResponse.text()
    const allEvents = parseCSV(csvText)

    // 2. Filter for boxing events with available PDF results
    const boxingWithResults = allEvents.filter(
      (row) =>
        row.category.toLowerCase() === 'boxing' &&
        row.results.length > 0 &&
        row.results.endsWith('.pdf')
    )

    // 3. Check which ones are already imported (by event number from PDF filename)
    const { firestore } = await import('../../../../lib/firebase-admin')
    const importedSnap = await firestore.collection('events').get()
    const importedNumbers = new Set(
      importedSnap.docs.map((doc) => doc.data().eventNumber)
    )

    // Extract event number from PDF filename pattern: YYYY-MM-DD-EVENTNUM-name.pdf
    const newEvents = boxingWithResults.filter((row) => {
      const match = row.results.match(/\d{4}-\d{2}-\d{2}-(\d+)-/)
      if (!match) return false
      return !importedNumbers.has(match[1])
    })

    // 4. Process new events: download PDF → parse → import
    const results: {
      processed: string[]
      errors: string[]
      skipped: number
    } = {
      processed: [],
      errors: [],
      skipped: boxingWithResults.length - newEvents.length,
    }

    for (const event of newEvents) {
      const pdfUrl = BASE_URL + event.results
      const filename = event.results.split('/').pop() || 'unknown.pdf'

      try {
        // Download the PDF
        const pdfResponse = await fetch(pdfUrl, {
          headers: { 'User-Agent': 'TXMX-Scraper/1.0' },
        })

        if (!pdfResponse.ok) {
          results.errors.push(`${filename}: HTTP ${pdfResponse.status}`)
          continue
        }

        const pdfBuffer = await pdfResponse.arrayBuffer()

        // Parse via the existing TDLR parse endpoint (self-call)
        const origin = request.nextUrl.origin
        const parseResponse = await fetch(`${origin}/api/tdlr-parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/pdf' },
          body: Buffer.from(pdfBuffer),
        })

        if (!parseResponse.ok) {
          const parseError = await parseResponse.json()
          results.errors.push(`${filename}: Parse error - ${parseError.error}`)
          continue
        }

        const parsedEvent = await parseResponse.json()

        if (parsedEvent.error) {
          results.errors.push(`${filename}: ${parsedEvent.error}`)
          continue
        }

        // Import to Firestore via existing action
        const { importTDLREvent } = await import('../../../actions/tdlr-import')
        const importResult = await importTDLREvent(parsedEvent)

        if (importResult.success) {
          results.processed.push(
            `${event.date} | ${event.promoter} | ${event.location} → ${importResult.results.boutsRecorded} bouts`
          )
        } else {
          results.errors.push(`${filename}: ${importResult.error}`)
        }
      } catch (err) {
        results.errors.push(
          `${filename}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      totalBoxingEvents: boxingWithResults.length,
      alreadyImported: results.skipped,
      newlyProcessed: results.processed.length,
      processed: results.processed,
      errors: results.errors,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
