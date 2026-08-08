import { useState, useMemo } from 'react';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import { Trash2, FileText, Search, Calendar, Activity, Sparkles, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../store/dataStore';
import { getIcon } from '../utils/icons';
import { getUnit } from '../utils/format';
import { ProgressDetailModal } from '../components/ProgressDetailModal';
import { ShareProgressModal } from '../components/ShareProgressModal';

type DateRange = '7d' | '30d' | 'all';

export function HistoryPage() {
  const { entries, categories, deleteEntry } = useData();
  const [catFilter, setCatFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [selectedCatDetail, setSelectedCatDetail] = useState<{
    id: string;
    name: string;
    unit: string;
    color: string;
    icon: string;
  } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const today = new Date();
    const from = dateRange === '7d' ? subDays(today, 7) : dateRange === '30d' ? subDays(today, 30) : subDays(today, 3650);

    const query = searchQuery.trim().toLowerCase();

    return entries
      .filter((e) => {
        const inRange = isWithinInterval(parseISO(e.date), { start: from, end: today });
        const inCat = catFilter === 'all' || e.categoryId === catFilter;

        const catObj = categories.find((c) => c.id === e.categoryId);
        const catNameMatches = catObj ? catObj.name.toLowerCase().includes(query) : false;
        const noteMatches = e.note ? e.note.toLowerCase().includes(query) : false;

        const matchesQuery = query === '' || catNameMatches || noteMatches;

        return inRange && inCat && matchesQuery;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, categories, catFilter, dateRange, searchQuery]);

  const totalVolume = useMemo(() => {
    return filtered.reduce((acc, curr) => acc + curr.value, 0);
  }, [filtered]);

  const groupedByDate = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const e of filtered) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return Object.entries(map);
  }, [filtered]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      try {
        await deleteEntry(id);
      } catch (err: unknown) {
        toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete');
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
    return format(parseISO(d), 'EEEE, MMM d');
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden h-36 border border-border bg-card p-4 flex flex-col justify-between select-none shadow-lg">
        <img src="/images/history_banner.webp" alt="History Banner" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-transparent" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
            <Activity size={11} className="text-accent" />
            Activity Log
          </span>
          <button onClick={() => setShareModalOpen(true)} className="text-[10px] font-semibold text-white/90 bg-accent/80 hover:bg-accent px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer">
            <Sparkles size={11} /> Share Log
          </button>
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-extrabold text-white tabular-nums">{filtered.length}</h1>
            <span className="text-xs text-white/80 font-medium">Entries recorded</span>
          </div>
          <p className="text-[11px] text-white/70 mt-0.5">
            Total Volume: <span className="font-semibold text-amber-300">{totalVolume.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search notes or activity name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        {/* Date range pills */}
        <div className="flex gap-1.5">
          {(['7d', '30d', 'all'] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${dateRange === r ? 'bg-foreground text-background' : 'bg-surface border border-border text-muted hover:text-foreground'}`}
            >
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : 'All time'}
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <button
              onClick={() => setCatFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${catFilter === 'all' ? 'bg-foreground text-background' : 'bg-surface border border-border text-muted hover:text-foreground'}`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border"
                style={catFilter === cat.id ? { background: cat.color, color: '#fff', borderColor: cat.color } : { background: 'var(--color-surface)', color: 'var(--color-muted)', borderColor: 'var(--color-border)' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline List */}
      {groupedByDate.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-xs text-muted">No activities found matching filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedByDate.map(([date, dayEntries]) => (
            <div key={date} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {/* Day Header */}
              <div className="px-4 py-2 bg-surface/50 border-b border-border/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar size={11} className="text-accent" />
                  {dateLabel(date)}
                </span>
                <span className="text-[10px] text-muted font-medium bg-card px-2 py-0.5 rounded-full border border-border">
                  {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {/* Entries */}
              {dayEntries.map((entry, i) => {
                const cat = categories.find((c) => c.id === entry.categoryId);
                if (!cat) return null;
                const Icon = getIcon(cat.icon);
                const isDeleting = deleteConfirm === entry.id;
                const unitStr = getUnit(cat.unit);

                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedCatDetail(cat)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface/60 transition-all ${i < dayEntries.length - 1 ? 'border-b border-border/50' : ''} ${isDeleting ? 'bg-red-500/10' : ''}`}
                  >
                    {/* Category Icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ background: `${cat.color}18` }}>
                      <Icon size={16} style={{ color: cat.color }} />
                    </div>

                    {/* Entry Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                        <ChevronRight size={11} className="text-muted/40" />
                      </div>
                      {entry.note && entry.note.trim().length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <FileText size={10} className="text-muted shrink-0" />
                          <p className="text-[11px] text-muted truncate">{entry.note.trim()}</p>
                        </div>
                      )}
                    </div>

                    {/* Value + Unit */}
                    <div className="text-right shrink-0 mr-1">
                      <span className="text-sm font-black text-foreground tabular-nums">{entry.value}</span>
                      {unitStr && <span className="text-xs font-normal text-muted ml-1">{unitStr}</span>}
                    </div>

                    {/* Delete action */}
                    <button
                      id={`btn-delete-${entry.id}`}
                      onClick={(e) => handleDelete(e, entry.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${isDeleting ? 'bg-red-500 text-white' : 'text-muted/40 hover:text-red-400 hover:bg-surface'}`}
                      title="Delete entry"
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

      {/* Progress Detail Modal */}
      {selectedCatDetail && (
        <ProgressDetailModal
          isOpen={Boolean(selectedCatDetail)}
          onClose={() => setSelectedCatDetail(null)}
          onOpenShare={() => {
            setSelectedCatDetail(null);
            setShareModalOpen(true);
          }}
          category={selectedCatDetail}
          entries={entries}
        />
      )}

      {/* Share Progress Modal */}
      <ShareProgressModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Activity Stream History"
        stats={{
          totalValue: filtered.length,
          totalLogs: filtered.length,
          streakDays: 7,
          periodLabel: `${filtered.length} entries recorded in this period`,
        }}
      />
    </div>
  );
}
