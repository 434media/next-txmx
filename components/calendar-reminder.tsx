"use client"

interface CalendarReminderProps {
  title: string
  date: string // YYYY-MM-DD
  venue: string
  address?: string
  city: string
}

function toICSDate(dateStr: string, hour: number): string {
  // dateStr is YYYY-MM-DD, convert to ICS format: YYYYMMDDTHHMMSS
  return dateStr.replace(/-/g, "") + `T${String(hour).padStart(2, "0")}0000`
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === "\n") return "\\n"
    return `\\${match}`
  })
}

export default function CalendarReminder({
  title,
  date,
  venue,
  address,
  city,
}: CalendarReminderProps) {
  const handleDownloadICS = () => {
    const location = [venue, address, city].filter(Boolean).join(", ")
    const dtStart = toICSDate(date, 19) // 7 PM default start
    const dtEnd = toICSDate(date, 23)   // 11 PM default end
    const uid = `txmx-${date}-${title.replace(/\s+/g, "-").toLowerCase()}@txmxboxing.com`

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TXMX Boxing//Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(title)}`,
      `LOCATION:${escapeICS(location)}`,
      `DESCRIPTION:${escapeICS(`TXMX Boxing Event\\n${title}\\n${location}\\n\\nMore info: https://www.txmxboxing.com/events`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:TXMX Boxing event tomorrow!",
      "END:VALARM",
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      "DESCRIPTION:TXMX Boxing event starts in 2 hours!",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `txmx-${date}.ics`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <button
      onClick={handleDownloadICS}
      className="flex items-center gap-1.5 text-white/50 hover:text-white/70 transition-colors p-1.5"
      title="Add to calendar"
      aria-label="Add to calendar"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
  )
}
