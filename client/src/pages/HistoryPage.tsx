import { useState, useMemo } from 'react';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import { Trash2, X, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../store/dataStore';
import { getIcon } from '../utils/icons';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export function HistoryPage() {
  const { entries, categories, deleteEntry } = useData();

  const [catFilter, setCatFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('90d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const today = new Date();
    let from: Date;
    let to: Date = today;

    if (dateRange === '7d') from = subDays(today, 7);
    else if (dateRange === '30d') from = subDays(today, 30);
    else if (dateRange === '90d') from = subDays(today, 90);
    else {
      from = customFrom ? parseISO(customFrom) : subDays(today, 365);
      to = customTo ? parseISO(customTo) : today;
    }

    return entries
      .filter(e => {
        const inRange = isWithinInterval(parseISO(e.date), { start: from, end: to });
        const inCat = catFilter === 'all' || e.categoryId === catFilter;
        return inRange && inCat;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, catFilter, dateRange, customFrom, customTo]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteEntry(id);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Gagal menghapus entry');
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">History</h1>
        <p className="text-xs sm:text-sm text-muted mt-0.5">{filtered.length} entries found</p>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div className="w-full sm:w-44">
            <Select
              id="filter-category"
              label="Category"
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-36">
            <Select
              id="filter-date-range"
              label="Date range"
              value={dateRange}
              onChange={e => setDateRange(e.target.value as DateRange)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom</option>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <Input id="filter-from" label="From" type="date" value={customFrom}
                onChange={e => setCustomFrom(e.target.value)} className="w-full sm:w-36" />
              <Input id="filter-to" label="To" type="date" value={customTo}
                onChange={e => setCustomTo(e.target.value)} className="w-full sm:w-36" />
            </div>
          )}

          {(catFilter !== 'all' || dateRange !== '90d') && (
            <button
              id="btn-clear-filters"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors py-2 sm:mt-5 min-h-[38px]"
              onClick={() => { setCatFilter('all'); setDateRange('90d'); }}
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* MOBILE VIEW: Stacked Card List (visible on < md breakpoint) */}
      <div className="space-y-2.5 md:hidden">
        {filtered.length === 0 ? (
          <Card className="!p-8 text-center text-sm text-muted">
            No entries found for the selected filters.
          </Card>
        ) : (
          filtered.map(entry => {
            const cat = categories.find(c => c.id === entry.categoryId);
            if (!cat) return null;
            const Icon = getIcon(cat.icon);
            const isDeleting = deleteConfirm === entry.id;
            return (
              <div
                key={entry.id}
                className={`bg-card border rounded-lg p-4 transition-colors ${
                  isDeleting ? 'border-red-500/50 bg-red-500/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cat.color}1a` }}
                    >
                      <Icon size={18} style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                        <Calendar size={12} />
                        <span>{format(parseISO(entry.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground tabular-nums">{entry.value}</span>
                      <span className="text-xs text-muted ml-1">{cat.unit}</span>
                    </div>

                    <button
                      id={`btn-delete-mobile-${entry.id}`}
                      onClick={() => handleDelete(entry.id)}
                      className={`p-2 rounded-md transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center ${
                        isDeleting
                          ? 'bg-red-500 text-white'
                          : 'text-muted hover:text-red-400 hover:bg-surface'
                      }`}
                      title={isDeleting ? 'Click again to confirm' : 'Delete entry'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {entry.note && (
                  <div className="mt-3 pt-2.5 border-t border-border flex items-start gap-1.5 text-xs text-muted">
                    <FileText size={13} className="shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{entry.note}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Table (visible on >= md breakpoint) */}
      <Card className="!p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted px-5 py-3">Category</th>
                <th className="text-left text-xs font-medium text-muted px-5 py-3">Value</th>
                <th className="text-left text-xs font-medium text-muted px-5 py-3">Note</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-sm text-muted py-12">
                    No entries found for the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(entry => {
                  const cat = categories.find(c => c.id === entry.categoryId);
                  if (!cat) return null;
                  const Icon = getIcon(cat.icon);
                  const isDeleting = deleteConfirm === entry.id;
                  return (
                    <tr
                      key={entry.id}
                      className={`group transition-colors ${isDeleting ? 'bg-red-500/5' : 'hover:bg-surface/50'}`}
                    >
                      <td className="px-5 py-3 text-foreground font-medium tabular-nums text-xs">
                        {format(parseISO(entry.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                            style={{ background: `${cat.color}1a` }}
                          >
                            <Icon size={11} style={{ color: cat.color }} />
                          </div>
                          <span className="text-xs text-foreground">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-foreground tabular-nums">
                        <span className="font-semibold">{entry.value}</span>{' '}
                        <span className="text-muted">{cat.unit}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted max-w-xs truncate">
                        {entry.note ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          id={`btn-delete-${entry.id}`}
                          onClick={() => handleDelete(entry.id)}
                          className={`p-1.5 rounded transition-colors ${isDeleting
                              ? 'bg-red-500 text-white'
                              : 'text-muted hover:text-red-400 opacity-0 group-hover:opacity-100'
                            }`}
                          title={isDeleting ? 'Click again to confirm' : 'Delete entry'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
