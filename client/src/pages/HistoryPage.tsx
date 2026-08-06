import { useState, useMemo } from 'react';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import { Trash2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../store/dataStore';
import { getIcon } from '../utils/icons';
import { formatUnit } from '../utils/format';

type DateRange = '7d' | '30d' | 'all';

export function HistoryPage() {
  const { entries, categories, deleteEntry } = useData();
  const [catFilter, setCatFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const today = new Date();
    const from =
      dateRange === '7d' ? subDays(today, 7) :
      dateRange === '30d' ? subDays(today, 30) :
      subDays(today, 3650);

    return entries
      .filter(e => {
        const inRange = isWithinInterval(parseISO(e.date), { start: from, end: today });
        const inCat = catFilter === 'all' || e.categoryId === catFilter;
        return inRange && inCat;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, catFilter, dateRange]);

  const groupedByDate = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const e of filtered) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return Object.entries(map);
  }, [filtered]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try { await deleteEntry(id); } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete');
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yestStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  function dateLabel(d: string) {
    if (d === todayStr) return 'Today';
    if (d === yestStr) return 'Yesterday';
    return format(parseISO(d), 'MMM d, yyyy');
  }

  return (
    <div className="space-y-4 pb-4">

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-foreground">History</h1>
        <p className="text-xs text-muted mt-0.5">{filtered.length} entries</p>
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        {/* Date range */}
        <div className="flex gap-1.5">
          {(['7d', '30d', 'all'] as DateRange[]).map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                dateRange === r
                  ? 'bg-foreground text-background'
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              }`}
            >
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : 'All time'}
            </button>
          ))}
        </div>

        {/* Category filter — horizontal scroll */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <button
              onClick={() => setCatFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                catFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border"
                style={
                  catFilter === cat.id
                    ? { background: cat.color, color: '#fff', borderColor: cat.color }
                    : { background: 'var(--color-surface)', color: 'var(--color-muted)', borderColor: 'var(--color-border)' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      {groupedByDate.length === 0 ? (
        <p className="text-sm text-muted text-center py-12">No entries found.</p>
      ) : (
        <div className="space-y-3">
          {groupedByDate.map(([date, dayEntries]) => (
            <div key={date} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Day header */}
              <div className="px-4 py-2 border-b border-border/60">
                <span className="text-[11px] font-semibold text-muted">{dateLabel(date)}</span>
              </div>

              {/* Entries */}
              {dayEntries.map((entry, i) => {
                const cat = categories.find(c => c.id === entry.categoryId);
                if (!cat) return null;
                const Icon = getIcon(cat.icon);
                const isDeleting = deleteConfirm === entry.id;
                const unitStr = formatUnit(cat.unit);

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < dayEntries.length - 1 ? 'border-b border-border/50' : ''
                    } ${isDeleting ? 'bg-red-500/5' : ''}`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cat.color}18` }}
                    >
                      <Icon size={14} style={{ color: cat.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
                      {entry.note && entry.note.trim().length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <FileText size={10} className="text-muted shrink-0" />
                          <p className="text-[11px] text-muted truncate">{entry.note.trim()}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0 mr-1">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {entry.value}
                      </span>
                      {unitStr && (
                        <span className="text-xs font-normal text-muted ml-1">{unitStr}</span>
                      )}
                    </div>

                    <button
                      id={`btn-delete-${entry.id}`}
                      onClick={() => handleDelete(entry.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isDeleting
                          ? 'bg-red-500 text-white'
                          : 'text-muted/40 hover:text-red-400 hover:bg-surface'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
