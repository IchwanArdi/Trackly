import { useState, useMemo } from 'react';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import { Trash2, SlidersHorizontal, X } from 'lucide-react';
import { useData } from '../store/dataStore';
import { getIcon } from '../utils/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteEntry(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">History</h1>
        <p className="text-sm text-muted mt-0.5">{filtered.length} entries found</p>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-44">
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

          <div className="w-36">
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
            <>
              <Input id="filter-from" label="From" type="date" value={customFrom}
                onChange={e => setCustomFrom(e.target.value)} className="w-36" />
              <Input id="filter-to" label="To" type="date" value={customTo}
                onChange={e => setCustomTo(e.target.value)} className="w-36" />
            </>
          )}

          {(catFilter !== 'all' || dateRange !== '90d') && (
            <button
              id="btn-clear-filters"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mt-5"
              onClick={() => { setCatFilter('all'); setDateRange('90d'); }}
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
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
                          className={`p-1.5 rounded transition-colors ${
                            isDeleting
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
