type CalendarDate = {
  year: number
  month: number
  day: number
}

function readParts(date: Date, timeZone: string, includeTime = false) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "iso8601",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
      : {}),
  })

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = readParts(date, timeZone, true)
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )

  return representedAsUtc - Math.floor(date.getTime() / 1000) * 1000
}

function calendarMidnightToUtc(date: CalendarDate, timeZone: string) {
  const wallClockUtc = Date.UTC(date.year, date.month - 1, date.day)
  let candidate = wallClockUtc

  // Recalculate because the UTC guess can sit on the other side of a DST change.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const adjusted = wallClockUtc - getTimeZoneOffsetMs(new Date(candidate), timeZone)
    if (adjusted === candidate) break
    candidate = adjusted
  }

  return new Date(candidate)
}

export function getDailyTimeWindow(now = new Date(), timeZone = "Europe/Rome") {
  const current = readParts(now, timeZone)
  const today = {
    year: current.year,
    month: current.month,
    day: current.day,
  }
  const tomorrowCalendar = new Date(Date.UTC(today.year, today.month - 1, today.day + 1))
  const tomorrow = {
    year: tomorrowCalendar.getUTCFullYear(),
    month: tomorrowCalendar.getUTCMonth() + 1,
    day: tomorrowCalendar.getUTCDate(),
  }

  return {
    dateKey: `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`,
    start: calendarMidnightToUtc(today, timeZone),
    end: calendarMidnightToUtc(tomorrow, timeZone),
  }
}
