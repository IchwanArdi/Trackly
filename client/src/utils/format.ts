export const RANDOM_UNIT = [
  "km",
  "session",
  "minutes",
  "pages",
  "hours",
  "reps",
  "sets",
];

export const UNIT_OPTIONS = RANDOM_UNIT;

// Fallback aja kalau unit kosong/undefined — custom unit apapun tetap dipakai apa adanya
export function getUnit(name?: string): string {
  return name && name.trim() !== '' ? name : 'km';
}