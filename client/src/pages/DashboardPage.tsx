import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Plus, Flame, Calendar, BarChart2, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

import { useData } from '../store/dataStore';
import { computeStreaks } from '../utils/stats';
import { getIcon } from '../utils/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap';
import { StreakCounter } from '../components/dashboard/StreakCounter';
import { isAuthenticated } from '../utils/auth';

export function DashboardPage() {
  const { entries, categories } = useData();
  const navigate = useNavigate();

  // Cek apakah user sudah login, jika tidak maka redirect ke halaman login
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const { streaks, monthEntries, topCategory, weeklyData, recentEntries } = useMemo(() => {
    const streaks = computeStreaks(entries);

    const monthEntries = entries.filter(e =>
      isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
    );

    // Most active category this month
    const catCount: Record<string, number> = {};
    monthEntries.forEach(e => { catCount[e.categoryId] = (catCount[e.categoryId] ?? 0) + 1; });
    const topCatId = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCategory = categories.find(c => c.id === topCatId);

    // Weekly bar chart — last 7 days
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = entries.filter(e => e.date === dateStr).length;
      return { day: format(d, 'EEE'), count };
    });

    // Recent 5 entries
    const recentEntries = [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return { streaks, monthEntries, topCategory, weeklyData, recentEntries };
  }, [entries, categories]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button
          id="btn-add-entry"
          variant="primary"
          size="md"
          icon={<Plus size={14} />}
          onClick={() => navigate('/log')}
        >
          Log activity
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">This month</span>
            <Calendar size={14} className="text-muted" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{monthEntries.length}</p>
          <p className="text-xs text-muted mt-0.5">total entries</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Streak</span>
            <Flame size={14} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{streaks.current}</p>
          <p className="text-xs text-muted mt-0.5">days in a row</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Top category</span>
            <BarChart2 size={14} className="text-muted" />
          </div>
          {topCategory ? (
            <>
              <p className="text-lg font-bold text-foreground">{topCategory.name}</p>
              <p className="text-xs text-muted mt-0.5">most logged this month</p>
            </>
          ) : (
            <p className="text-sm text-muted">No data yet</p>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Longest streak</span>
            <TrendingUp size={14} className="text-muted" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{streaks.longest}</p>
          <p className="text-xs text-muted mt-0.5">days personal best</p>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Activity overview</h2>
            <p className="text-xs text-muted mt-0.5">Last 90 days</p>
          </div>
          <StreakCounter current={streaks.current} longest={streaks.longest} />
        </div>
        <ContributionHeatmap entries={entries} />
      </Card>

      {/* Weekly bar chart + Recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly activity */}
        <Card>
          <h2 className="text-sm font-semibold text-foreground mb-4">Last 7 days</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--color-foreground)',
                  boxShadow: 'none',
                }}
                cursor={{ fill: 'var(--color-surface)' }}
              />
              <Bar dataKey="count" name="Entries" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent entries */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent entries</h2>
            <button
              id="btn-view-all-history"
              onClick={() => navigate('/history')}
              className="text-xs text-accent hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {recentEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId);
              if (!cat) return null;
              const Icon = getIcon(cat.icon);
              return (
                <div key={entry.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${cat.color}1a` }}
                  >
                    <Icon size={13} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{cat.name}</p>
                    <p className="text-[10px] text-muted">{entry.date}</p>
                  </div>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {entry.value} <span className="font-normal text-muted">{cat.unit}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
