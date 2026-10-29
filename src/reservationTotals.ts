const losAngelesDate = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles', year: 'numeric', month: 'numeric', day: 'numeric',
})
const millisecondsPerDay = 86_400_000
const baselineDay = Date.UTC(2026, 9, 29) / millisecondsPerDay

/** Approximate total, adding two per weekday and one per weekend day after Oct 29. */
export function getEstimatedReservationsShared(date: Date): string {
  const { year, month, day } = Object.fromEntries(losAngelesDate.formatToParts(date).map(part => [part.type, part.value]))
  const calendarDay = Date.UTC(Number(year), Number(month) - 1, Number(day)) / millisecondsPerDay
  const elapsedDays = Math.max(0, calendarDay - baselineDay)
  let total = 50 + Math.floor(elapsedDays / 7) * 12
  for (let offset = 1; offset <= elapsedDays % 7; offset++) {
    const weekday = (4 + offset) % 7 // Baseline is Thursday; count only subsequent days.
    total += weekday === 0 || weekday === 6 ? 1 : 2
  }
  return `≈${total}`
}
