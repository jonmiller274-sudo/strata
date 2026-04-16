/**
 * Returns a human-readable relative time string from a date string.
 * Uses Intl.RelativeTimeFormat — no external dependencies.
 *
 * Examples:
 *   "just now"        (< 1 minute ago)
 *   "5 minutes ago"
 *   "1 hour ago"
 *   "3 days ago"
 *   "2 weeks ago"
 *   "1 month ago"
 */
export function getRelativeTime(dateStr: string): string {
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSeconds = Math.round((then - now) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return "just now";
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffSeconds / 3600);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffSeconds / 86400);
  if (Math.abs(diffDays) < 7) {
    return formatter.format(diffDays, "day");
  }

  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 5) {
    return formatter.format(diffWeeks, "week");
  }

  const diffMonths = Math.round(diffDays / 30);
  return formatter.format(diffMonths, "month");
}
