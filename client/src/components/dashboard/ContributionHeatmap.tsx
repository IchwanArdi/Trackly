import { useMemo } from 'react';
import {
  eachDayOfInterval, subDays, format, startOfWeek, parseISO, getDay, getMonth, getYear
} from 'date-fns';
import { type Entry } from '../../data/mockData';
import { buildDayMap, intensityLevel } from '../../utils/stats';
import { useData } from '../../store/dataStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Tailwind-compatible intensity classes (using CSS variables)
const intensityStyle = (level: 0 | 1 | 2 | 3 | 4): string => {
  switch (level) {
    case 0: return 'bg-surface border border-border';
    case 1: return 'bg-accent/20 border border-accent/10';
    case 2: return 'bg-accent/40 border border-accent/20';
    case 3: return 'bg-accent/65 border border-accent/30';
    case 4: return 'bg-accent border border-accent';
    default: return 'bg-surface border border-border';
  }
};

interface HeatmapProps {
  entries: Entry[];
}

export function ContributionHeatmap({ entries }: HeatmapProps) {
  const { categories } = useData();

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 90);
    const alignedStart = startOfWeek(startDate, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: alignedStart, end: today });
    const dayMap = buildDayMap(entries);

    // Group into weeks
    const weeks: Array<Array<{ date: Date; dateStr: string; count: number } | null>> = [];
    let week: Array<{ date: Date; dateStr: string; count: number } | null> = [];

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      week.push({ date: day, dateStr, count: dayMap[dateStr] ?? 0 });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    // Month labels: find week index where month changes
    const monthLabels: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;
    weeks.forEach((wk, i) => {
      const firstDay = wk.find(d => d !== null);
      if (firstDay) {
        const m = getMonth(firstDay.date);
        if (m !== lastMonth) {
          monthLabels.push({ label: MONTHS[m], col: i });
          lastMonth = m;
        }
      }
    });

    return { weeks, monthLabels };
  }, [entries]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map(({ label, col }, i) => (
            <div
              key={i}
              className="text-[10px] text-muted font-medium"
              style={{ marginLeft: col === 0 ? 0 : (col - (monthLabels[i - 1]?.col ?? 0)) * 12 - (label.length * 3.5) }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 pr-1">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-[9px] text-muted h-2.5 leading-none flex items-center ${i % 2 === 0 ? 'invisible' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) =>
                  day === null ? (
                    <div key={di} className="w-2.5 h-2.5" />
                  ) : (
                    <div
                      key={di}
                      title={`${format(day.date, 'MMM d, yyyy')} — ${day.count} ${day.count === 1 ? 'entry' : 'entries'}`}
                      className={`w-2.5 h-2.5 rounded-sm cursor-default transition-opacity hover:opacity-80 ${intensityStyle(intensityLevel(day.count))}`}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-muted">Less</span>
          {([0, 1, 2, 3, 4] as const).map(lvl => (
            <div key={lvl} className={`w-2.5 h-2.5 rounded-sm ${intensityStyle(lvl)}`} />
          ))}
          <span className="text-[10px] text-muted">More</span>
        </div>
      </div>
    </div>
  );
}
