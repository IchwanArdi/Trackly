/**
 * Cleanly formats category units by removing leading "1" or "1 "
 * E.g.: "1km" -> "km", "1 km" -> "km", "1 session" -> "session", "km" -> "km"
 */
export function formatUnit(unit?: string): string {
  if (!unit) return '';
  return unit.trim().replace(/^1\s*/, '');
}
