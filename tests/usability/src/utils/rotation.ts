/**
 * Daily rotation logic.
 *
 * Given a list of scenario IDs and a date, returns which 2-3 scenarios
 * to run today. Uses day-of-year modulo to rotate through the list,
 * ensuring full coverage within ceil(total / 2) days.
 */
export function getScenariosForToday(
  allScenarioIds: string[],
  date: Date = new Date()
): string[] {
  const count = allScenarioIds.length;
  if (count === 0) return [];
  if (count <= 3) return [...allScenarioIds];

  // Day of year (0-indexed)
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Pick 2-3 scenarios using round-robin
  const perDay = count <= 4 ? 2 : 3;
  const startIndex = (dayOfYear * perDay) % count;

  const selected: string[] = [];
  for (let i = 0; i < perDay; i++) {
    const idx = (startIndex + i) % count;
    selected.push(allScenarioIds[idx]);
  }

  return selected;
}
