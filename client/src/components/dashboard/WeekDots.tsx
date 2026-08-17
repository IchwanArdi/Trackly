import { format, subDays } from "date-fns";

export default function WeekDots({ entries }: { entries: { date: string }[] }) {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(today, 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const isToday = i === 6;
        const hasEntry = entries.some((e) => e.date === dateStr);
        return { label: format(d, 'EEE').slice(0, 1), dateStr, isToday, hasEntry };
    });

    return (
        <div className="flex items-end justify-between mt-4">
            {days.map(({ label, dateStr, isToday, hasEntry }) => (
                <div key={dateStr} className="flex flex-col items-center gap-1.5">
                    <div
                        className={`rounded-full transition-colors ${isToday ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}
                        style={{
                            background: hasEntry ? 'var(--color-accent)' : 'var(--color-surface)',
                            border: hasEntry ? 'none' : '1.5px solid var(--color-border)',
                            outline: isToday && !hasEntry ? '1.5px solid var(--color-accent)' : 'none',
                            outlineOffset: '1.5px',
                        }}
                    />
                    <span className={`text-[10px] ${isToday ? 'text-accent font-semibold' : 'text-muted'}`}>{label}</span>
                </div>
            ))}
        </div>
    );
}

