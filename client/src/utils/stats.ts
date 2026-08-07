import { format, parseISO, differenceInDays, subDays } from 'date-fns';
import { type Entry } from '../store/dataStore';

/** Map of date string → total entries on that day */
export function buildDayMap(entries: Entry[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of entries) {
    map[e.date] = (map[e.date] ?? 0) + 1;
  }
  return map;
}

/** Returns the current streak (days back from today with ≥1 entry, no gap) */
export function computeStreaks(entries: Entry[]): { current: number; longest: number } {
  if (entries.length === 0) return { current: 0, longest: 0 };

  const datesWithEntries = new Set(entries.map((e) => e.date));
  const today = new Date();

  let current = 0;
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  let ptr: Date;

  if (datesWithEntries.has(todayStr)) {
    ptr = today;
  } else if (datesWithEntries.has(yesterdayStr)) {
    ptr = subDays(today, 1);
  } else {
    // No recent entry
    return computeLongest(datesWithEntries);
  }

  while (datesWithEntries.has(format(ptr, 'yyyy-MM-dd'))) {
    current++;
    ptr = subDays(ptr, 1);
  }

  const { longest } = computeLongest(datesWithEntries);
  return { current, longest: Math.max(current, longest) };
}

function computeLongest(datesWithEntries: Set<string>): { current: number; longest: number } {
  if (datesWithEntries.size === 0) return { current: 0, longest: 0 };

  const sorted = Array.from(datesWithEntries).sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const curr = parseISO(sorted[i]);
    if (differenceInDays(curr, prev) === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return { current: 0, longest };
}

/** Group entries by date, most recent first */
export function groupByDate(entries: Entry[]): Record<string, Entry[]> {
  const map: Record<string, Entry[]> = {};
  for (const e of entries) {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  }
  return map;
}

/** Compute activity intensity level (0-4) from entry count, for heatmap */
export function intensityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}
