import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Entry, type Category } from '../../store/dataStore';

interface MonthlyCalendarProps {
  entries: Entry[];
  category?: Category;
  color?: string;
}

export function MonthlyCalendar({ entries, category, color = 'var(--color-accent)' }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  // Group entries by date for fast lookup
  const entryMap = useMemo(() => {
    const map: Record<string, Entry[]> = {};
    entries.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="w-full select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-foreground tracking-wide uppercase">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-surface border border-border text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-surface border border-border text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
        {weekdays.map(d => (
          <div key={d} className="text-[10px] font-semibold text-muted tracking-wider uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEntries = entryMap[dateStr] || [];
          const hasActivity = dayEntries.length > 0;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isSameDay(day, new Date());
          
          // Total value of logs for this day
          const totalValue = dayEntries.reduce((sum, e) => sum + e.value, 0);
          
          // Hover description
          const tooltipText = hasActivity
            ? `${dayEntries.length} log${dayEntries.length > 1 ? 's' : ''}: ${totalValue} ${category?.unit ?? ''}\n${dayEntries.map(e => e.note ? `• ${e.note}` : '').filter(Boolean).join('\n')}`
            : 'No activity';

          // Day styling
          let dayStyle = {};
          if (hasActivity && isCurrentMonth) {
            dayStyle = {
              backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
              boxShadow: `0 0 10px color-mix(in srgb, ${color} 12%, transparent)`,
            };
          }

          return (
            <div
              key={idx}
              title={tooltipText}
              style={dayStyle}
              className={`
                aspect-square rounded-lg border flex flex-col items-center justify-between p-1.5 relative group transition-all duration-150
                ${isCurrentMonth ? 'text-foreground' : 'text-muted/30 border-transparent pointer-events-none'}
                ${isTodayDate ? 'border-accent/60 font-semibold' : 'border-border'}
                ${hasActivity && isCurrentMonth ? 'hover:scale-[1.04]' : 'bg-surface hover:border-border/80'}
              `}
            >
              {/* Day number */}
              <span className={`text-[10px] self-start leading-none ${isTodayDate ? 'text-accent' : ''}`}>
                {format(day, 'd')}
              </span>

              {/* Day Value / Indicator */}
              {hasActivity && isCurrentMonth && (
                <div className="w-full flex flex-col items-center mt-1">
                  <span 
                    style={{ color }}
                    className="text-[9px] font-bold tracking-tight truncate max-w-full leading-none"
                  >
                    {totalValue}
                  </span>
                  
                  {/* Note marker */}
                  {dayEntries.some(e => e.note) && (
                    <span 
                      style={{ backgroundColor: color }}
                      className="w-1 h-1 rounded-full mt-0.5"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
