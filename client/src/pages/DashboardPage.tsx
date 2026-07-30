import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, subDays } from 'date-fns';
import { Plus, Flame, Calendar, BarChart2, TrendingUp, CalendarDays, Grid, LineChart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

import { useData } from '../store/dataStore';
import { computeStreaks } from '../utils/stats';
import { getIcon } from '../utils/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap';
import { MonthlyCalendar } from '../components/dashboard/MonthlyCalendar';
import { StreakCounter } from '../components/dashboard/StreakCounter';
import { isAuthenticated } from '../utils/auth';

export function DashboardPage() {
  const { entries, categories } = useData();
  const navigate = useNavigate();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'calendar' | 'grid' | 'trend'>('calendar');

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

  // Filter entries for heatmap
  const filteredEntriesForHeatmap = useMemo(() => {
    if (selectedCategoryFilter === 'all') return entries;
    return entries.filter(e => e.categoryId === selectedCategoryFilter);
  }, [entries, selectedCategoryFilter]);

  // Compute streaks for heatmap based on the filtered entries
  const streaksForHeatmap = useMemo(() => {
    return computeStreaks(filteredEntriesForHeatmap);
  }, [filteredEntriesForHeatmap]);

  // Determine heatmap color based on selected category
  const heatmapColor = useMemo(() => {
    if (selectedCategoryFilter === 'all') return 'var(--color-accent)';
    const cat = categories.find(c => c.id === selectedCategoryFilter);
    return cat?.color ?? 'var(--color-accent)';
  }, [categories, selectedCategoryFilter]);

  // Find selected category object
  const selectedCategoryObj = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryFilter);
  }, [categories, selectedCategoryFilter]);

  // Compute trend data (last 30 days)
  const trendData = useMemo(() => {
    const data = [];
    const isAll = selectedCategoryFilter === 'all';
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayEntries = filteredEntriesForHeatmap.filter(e => e.date === dateStr);
      
      const value = isAll
        ? dayEntries.length // Count for "All"
        : dayEntries.reduce((sum, e) => sum + e.value, 0); // Value sum for specific category
        
      data.push({
        date: format(d, 'MMM d'),
        value
      });
    }
    return data;
  }, [filteredEntriesForHeatmap, selectedCategoryFilter]);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Activity overview</h2>
            <p className="text-xs text-muted mt-0.5">
              {activeTab === 'calendar' ? 'Monthly tracking calendar' : activeTab === 'grid' ? 'Last 90 days grid' : 'Last 30 days trend'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="flex bg-surface p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <CalendarDays size={13} />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'grid'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Grid size={13} />
                Grid
              </button>
              <button
                onClick={() => setActiveTab('trend')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'trend'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <LineChart size={13} />
                Trend
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs bg-surface border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            
            <StreakCounter current={streaksForHeatmap.current} longest={streaksForHeatmap.longest} />
          </div>
        </div>

        {/* Conditional Content */}
        {activeTab === 'calendar' && (
          <MonthlyCalendar
            entries={filteredEntriesForHeatmap}
            category={selectedCategoryObj}
            color={heatmapColor}
          />
        )}

        {activeTab === 'grid' && (
          <ContributionHeatmap entries={filteredEntriesForHeatmap} color={heatmapColor} />
        )}

        {activeTab === 'trend' && (
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={heatmapColor} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={heatmapColor} stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 11,
                    color: 'var(--color-foreground)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(val: any) => [
                    `${val} ${selectedCategoryFilter === 'all' ? 'entries' : (selectedCategoryObj?.unit ?? '')}`,
                    selectedCategoryFilter === 'all' ? 'Volume' : 'Logged Amount'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={heatmapColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
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
