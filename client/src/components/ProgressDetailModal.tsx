import { useMemo } from 'react';
import { X, Share2, Zap, BarChart2 } from 'lucide-react';
import { format, subDays, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { renderIcon } from '../utils/icons';
import { getUnit } from '../utils/format';
import type { ShareCategoryData } from './ShareProgressModal';

interface ProgressDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShare: (
    category: ShareCategoryData,
    stats: { totalValue: number; totalLogs: number; streakDays: number; periodLabel: string }
  ) => void;
  category: {
    id: string;
    name: string;
    unit: string;
    color: string;
    icon: string;
  };
  entries: { id: string; categoryId: string; date: string; value: number; note?: string }[];
}

export function ProgressDetailModal({ isOpen, onClose, onOpenShare, category, entries }: ProgressDetailModalProps) {
  const categoryId = category?.id;
  const categoryIcon = category?.icon;
  const categoryUnit = category?.unit;
  const categoryColor = category?.color;

  const cleanUnit = useMemo(() => getUnit(categoryUnit), [categoryUnit]);

  // Compute category specific deep metrics
  const { totalValue, totalCount, avgValue, monthValue, chartData, consistencyPct, activeDays30 } = useMemo(() => {
    const catEntries = categoryId ? entries.filter((e) => e.categoryId === categoryId).sort((a, b) => a.date.localeCompare(b.date)) : [];

    const totalValue = catEntries.reduce((sum, e) => sum + e.value, 0);
    const totalCount = catEntries.length;
    const avgValue = totalCount > 0 ? (totalValue / totalCount).toFixed(1) : '0';

    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthEntries = catEntries.filter((e) => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }));
    const monthValue = monthEntries.reduce((sum, e) => sum + e.value, 0);

    // Consistency over last 30 days
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(today, 29 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayEntries = catEntries.filter((e) => e.date === dateStr);
      const dayTotal = dayEntries.reduce((s, e) => s + e.value, 0);
      return {
        date: format(d, 'MMM d'),
        val: dayTotal,
      };
    });

    const activeDays30 = last30Days.filter((d) => d.val > 0).length;
    const consistencyPct = Math.round((activeDays30 / 30) * 100);

    return {
      catEntries,
      totalValue,
      totalCount,
      avgValue,
      monthValue,
      chartData: last30Days,
      consistencyPct,
      activeDays30,
    };
  }, [entries, categoryId]);

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detail-title"
        className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${categoryColor}20` }}>
              {renderIcon(categoryIcon ?? 'Activity', { size: 18, style: { color: categoryColor } })}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{category.name}</h2>
              <p className="text-[11px] text-muted">Activity Deep Breakdown</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-surface border border-border/80 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">Total</p>
              <p className="text-lg font-black text-foreground tabular-nums mt-1">{totalValue}</p>
              {cleanUnit && <p className="text-[10px] text-muted truncate">{cleanUnit}</p>}
            </div>

            <div className="bg-surface border border-border/80 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">This Month</p>
              <p className="text-lg font-black text-foreground tabular-nums mt-1">{monthValue}</p>
              {cleanUnit && <p className="text-[10px] text-muted truncate">{cleanUnit}</p>}
            </div>

            <div className="bg-surface border border-border/80 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">Avg / Session</p>
              <p className="text-lg font-black text-foreground tabular-nums mt-1">{avgValue}</p>
              {cleanUnit && <p className="text-[10px] text-muted truncate">{cleanUnit}</p>}
            </div>
          </div>

          {/* Consistency & Log Count summary */}
          <div className="bg-surface/50 border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${category.color}15` }}>
                <Zap size={18} style={{ color: category.color }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">30-Day Consistency</p>
                <p className="text-[11px] text-muted">{totalCount} total entries recorded</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-foreground">{consistencyPct}%</span>
              <p className="text-[10px] text-muted">active days</p>
            </div>
          </div>

          {/* 30-Day Trend Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1.5">
                <BarChart2 size={13} /> 30-Day Activity Pace
              </p>
            </div>
            <div className="h-36 bg-surface/30 border border-border rounded-xl pt-3 pr-2 pb-1 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`grad-${category.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={category.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={category.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-muted)' }} tickLine={false} interval={7} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: unknown) => [`${val} ${cleanUnit}`, category.name]}
                  />
                  <Area type="monotone" dataKey="val" stroke={category.color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${category.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action to share to social */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenShare(category, {
                  totalValue: monthValue || totalValue,
                  totalLogs: totalCount,
                  streakDays: activeDays30,
                  periodLabel: `Logged ${monthValue || totalValue} ${cleanUnit || ''} across ${totalCount} sessions`,
                });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent/90 cursor-pointer active:scale-95 transition-all shadow-md shadow-accent/20"
            >
              <Share2 size={14} />
              Share Strava-Style Story Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

