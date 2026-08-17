import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Plus, Check, Share2, BarChart2 } from 'lucide-react';
import { useData } from '../store/dataStore';
import { computeStreaks } from '../utils/stats';
import { getIcon } from '../utils/icons';
import { getUser } from '../utils/auth';
import { getUnit } from '../utils/format';
import { ShareProgressModal, type ShareCategoryData } from '../components/ShareProgressModal';
import { ProgressDetailModal } from '../components/ProgressDetailModal';
import WeekDots from '../components/dashboard/WeekDots';
import HighlightsDeck from '../components/dashboard/HighlightsDecs';

function getFirstName(fullName?: string) {
  return fullName?.split(' ')[0] ?? '';
}

export function DashboardPage() {
  const { entries, categories } = useData();
  const navigate = useNavigate();
  const user = getUser();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCategory, setShareCategory] = useState<ShareCategoryData | null>(null);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<{
    id: string;
    name: string;
    unit: string;
    color: string;
    icon: string;
  } | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const streaks = computeStreaks(entries);
  const monthEntries = entries.filter((e) => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }));
  const monthCount = monthEntries.length;
  const todayEntries = entries.filter((e) => e.date === todayStr);

  // Calculate top category this month
  const catCounts: Record<string, number> = {};
  for (const e of monthEntries) {
    catCounts[e.categoryId] = (catCounts[e.categoryId] || 0) + 1;
  }
  let topCategory: { name: string; icon: string; color: string; count: number; unit: string } | undefined = undefined;
  let maxCount = 0;
  for (const [catId, count] of Object.entries(catCounts)) {
    if (count > maxCount) {
      maxCount = count;
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        topCategory = { name: cat.name, icon: cat.icon, color: cat.color, count, unit: cat.unit };
      }
    }
  }

  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const map: Record<string, typeof recent> = {};
  for (const e of recent) {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  }
  const recentByDate = Object.entries(map).slice(0, 4);

  const todayLoggedCatIds = new Set(todayEntries.map((e) => e.categoryId));

  const yesterday = format(subDays(today, 1), 'yyyy-MM-dd');

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] text-muted">{format(today, 'EEEE, MMMM d')}</p>
          <h1 className="text-lg font-semibold text-foreground leading-snug mt-0.5">{getFirstName(user?.name) ? `Hi, ${getFirstName(user?.name)}` : 'Dashboard'}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-border text-foreground hover:bg-card text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
            title="Share progress card"
          >
            <Share2 size={13} className="text-accent" />
            Share
          </button>
          <button onClick={() => navigate('/log')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold cursor-pointer active:scale-95 transition-transform">
            <Plus size={13} />
            Log
          </button>
        </div>
      </div>

      {/* Horizontal Highlights Deck Carousel */}
      <HighlightsDeck streaks={streaks} monthCount={monthCount} categoriesCount={categories.length} todayLoggedCount={todayLoggedCatIds.size} topCategory={topCategory} onOpenShare={() => setShareModalOpen(true)} />

      {/* Streak & Week Dots Card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted mb-1">Current streak</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black text-foreground tabular-nums leading-none">{streaks.current}</span>
              <span className="text-base text-muted font-normal">{streaks.current === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted mb-0.5">Best</p>
            <p className="text-sm font-semibold text-foreground">{streaks.longest}d</p>
            <p className="text-[11px] text-muted mt-2 mb-0.5">This month</p>
            <p className="text-sm font-semibold text-foreground">{monthCount}</p>
          </div>
        </div>

        <WeekDots entries={entries} />
      </div>

      {/* Today's categories quick actions */}
      {categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium text-muted">Today's Categories</p>
            <span className="text-[10px] text-muted">Tap for deep insights</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 8).map((cat) => {
              const Icon = getIcon(cat.icon);
              const logged = todayLoggedCatIds.has(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryDetail(cat)}
                  className="flex items-center gap-2.5 p-3 bg-card border rounded-xl text-left cursor-pointer active:scale-[0.97] transition-all group"
                  style={{
                    borderColor: logged ? `${cat.color}60` : 'var(--color-border)',
                    backgroundColor: logged ? `${cat.color}08` : undefined,
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cat.color}18` }}>
                    <Icon size={15} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">{cat.name}</p>
                    <p className="text-[10px] text-muted flex items-center gap-1">
                      {logged ? <span className="text-emerald-500 font-semibold">Logged</span> : <span>Tap detail</span>}
                      <BarChart2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                  {logged && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: cat.color }}>
                      <Check size={9} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentByDate.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium text-muted">Recent</p>
            <button onClick={() => navigate('/history')} className="text-xs text-accent cursor-pointer">
              See all
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {recentByDate.map(([date, dayEntries], gi) => {
              const isToday = date === todayStr;
              const isYesterday = date === yesterday;
              const label = isToday ? 'Today' : isYesterday ? 'Yesterday' : format(parseISO(date), 'MMM d');

              return (
                <div key={date}>
                  {gi > 0 && <div className="h-px bg-border mx-4" />}
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">{label}</p>
                  </div>
                  {dayEntries.map((entry, ei) => {
                    const cat = categories.find((c) => c.id === entry.categoryId);
                    if (!cat) return null;
                    const Icon = getIcon(cat.icon);
                    const unitStr = getUnit(cat.unit);
                    return (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedCategoryDetail(cat)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-surface/50 transition-colors ${ei < dayEntries.length - 1 ? 'border-b border-border/50' : ''}`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cat.color}18` }}>
                          <Icon size={13} style={{ color: cat.color }} />
                        </div>
                        <p className="flex-1 text-xs font-medium text-foreground truncate">{cat.name}</p>
                        <span className="text-xs font-semibold text-foreground tabular-nums">
                          {entry.value} {unitStr && <span className="font-normal text-muted">{unitStr}</span>}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pb-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Progress Card Modal */}
      <ShareProgressModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareCategory(null);
        }}
        title="Monthly Activity Stream"
        category={shareCategory}
        topCategory={topCategory ? { name: topCategory.name, value: topCategory.count, unit: topCategory.unit, color: topCategory.color } : null}
        stats={
          shareCategory
            ? {
              totalValue:
                monthEntries.filter((e) => e.categoryId === shareCategory.id).reduce((sum, e) => sum + e.value, 0) ||
                entries.filter((e) => e.categoryId === shareCategory.id).reduce((sum, e) => sum + e.value, 0),
              totalLogs: entries.filter((e) => e.categoryId === shareCategory.id).length,
              streakDays: streaks.current,
              periodLabel: `Logged this month on Trackly`,
            }
            : {
              totalLogs: monthCount,
              streakDays: streaks.current,
              periodLabel: `Logged ${monthCount} sessions across ${categories.length} categories this month`,
              categoriesCount: categories.length,
            }
        }
      />

      {/* Progress Detail Modal */}
      {selectedCategoryDetail && (
        <ProgressDetailModal
          isOpen={Boolean(selectedCategoryDetail)}
          onClose={() => setSelectedCategoryDetail(null)}
          onOpenShare={(cat) => {
            setSelectedCategoryDetail(null);
            setShareCategory(cat);
            setShareModalOpen(true);
          }}
          category={selectedCategoryDetail}
          entries={entries}
        />
      )}
    </div>
  );
}
