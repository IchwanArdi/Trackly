import { subDays, format } from 'date-fns';

export interface Category {
  id: string;
  name: string;
  unit: string;
  color: string;
  icon: string;
}

export interface Entry {
  id: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  value: number;
  note?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Workout', unit: 'minutes', color: '#e85d04', icon: 'Dumbbell' },
  { id: 'cat-2', name: 'Reading', unit: 'pages', color: '#2d6a4f', icon: 'BookOpen' },
  { id: 'cat-3', name: 'Coding', unit: 'minutes', color: '#1d3461', icon: 'Code2' },
  { id: 'cat-4', name: 'Running', unit: 'km', color: '#7209b7', icon: 'Footprints' },
  { id: 'cat-5', name: 'Meditation', unit: 'minutes', color: '#bc6c25', icon: 'Wind' },
];

// Generate realistic mock entries spanning ~3 months with natural gaps
function generateEntries(): Entry[] {
  const entries: Entry[] = [];
  let id = 1;

  const today = new Date();

  // Define activity patterns per category (probability of logging on any given day)
  const patterns: Record<string, { prob: number; minVal: number; maxVal: number }> = {
    'cat-1': { prob: 0.55, minVal: 20, maxVal: 75 },
    'cat-2': { prob: 0.65, minVal: 10, maxVal: 80 },
    'cat-3': { prob: 0.70, minVal: 30, maxVal: 180 },
    'cat-4': { prob: 0.35, minVal: 3, maxVal: 12 },
    'cat-5': { prob: 0.45, minVal: 5, maxVal: 30 },
  };

  const notes: Record<string, string[]> = {
    'cat-1': ['Upper body day', 'Leg day', 'Full body HIIT', 'Cardio + weights', 'Push day'],
    'cat-2': ['Really gripping chapter', 'Slow day but made progress', 'Finished a chapter', '', ''],
    'cat-3': ['Working on side project', 'Bug fixing session', 'Learning new framework', 'Deep work', ''],
    'cat-4': ['Morning jog', 'Easy pace', 'New personal best!', 'Trail run', ''],
    'cat-5': ['Guided session', 'Breathing focus', '', 'Morning routine', ''],
  };

  // Seeded pseudo-random for consistency
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0xffffffff;
  };

  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    const date = subDays(today, daysAgo);
    const dateStr = format(date, 'yyyy-MM-dd');

    for (const cat of CATEGORIES) {
      const p = patterns[cat.id];
      // Add slight weekend boost for some, weekday boost for others
      const dayOfWeek = date.getDay();
      const weekendBonus = ['cat-1', 'cat-4'].includes(cat.id) && (dayOfWeek === 0 || dayOfWeek === 6) ? 0.15 : 0;
      const weekdayBonus = ['cat-3'].includes(cat.id) && dayOfWeek >= 1 && dayOfWeek <= 5 ? 0.1 : 0;

      if (rand() < p.prob + weekendBonus + weekdayBonus) {
        const value = Math.round(p.minVal + rand() * (p.maxVal - p.minVal));
        const catNotes = notes[cat.id];
        const noteIdx = Math.floor(rand() * catNotes.length);
        const note = catNotes[noteIdx] || undefined;

        entries.push({
          id: `entry-${id++}`,
          categoryId: cat.id,
          date: dateStr,
          value,
          note: note || undefined,
        });
      }
    }
  }

  return entries;
}

export const ENTRIES: Entry[] = generateEntries();
