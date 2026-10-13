// Native Intl formatters built once, outside functions and loops
const etbFormatter = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const whenFormatter = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeStyle: "short",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

/**
 * Formats a number or numeric string as Ethiopian Birr (ETB).
 * E.g., 250 -> "ETB 250"
 */
export function etb(amount) {
  const num = Number(amount) || 0;
  return etbFormatter.format(num);
}

/**
 * Formats a date into a localized medium date + short time string.
 * E.g., "Oct 13, 2026, 5:30 PM"
 */
export function when(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return isNaN(d.getTime()) ? "" : whenFormatter.format(d);
}

/**
 * Formats a date relative to now (e.g. "5 minutes ago", "in 2 hours").
 */
export function relative(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const diffInSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  if (absSeconds < 60) {
    return relativeFormatter.format(diffInSeconds, "second");
  }
  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return relativeFormatter.format(diffInMinutes, "minute");
  }
  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return relativeFormatter.format(diffInHours, "hour");
  }
  const diffInDays = Math.round(diffInHours / 24);
  return relativeFormatter.format(diffInDays, "day");
}
