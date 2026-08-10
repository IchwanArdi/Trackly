import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Plus, Check, ChevronRight, Flame, Trophy, Target, Share2, BarChart2 } from 'lucide-react';

import { useData } from '../store/dataStore';
import { computeStreaks } from '../utils/stats';
import { getIcon } from '../utils/icons';
import { isAuthenticated, getUser } from '../utils/auth';
import { getUnit } from '../utils/format';
import { ShareProgressModal, type ShareCategoryData } from '../components/ShareProgressModal';
import { ProgressDetailModal } from '../components/ProgressDetailModal';

function getFirstName(fullName?: string) {
  return fullName?.split(' ')[0] ?? '';
}

/** 7-dot week strip */
function WeekDots({ entries }: { entries: { date: string }[] }) {
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

/** Horizontal Swipeable Highlights Deck */
function HighlightsDeck({
  streaks,
  monthCount,
  categoriesCount,
  todayLoggedCount,
  topCategory,
  onOpenShare,
}: {
  streaks: { current: number; longest: number };
  monthCount: number;
  categoriesCount: number;
  todayLoggedCount: number;
  topCategory?: { name: string; icon: string; color: string; count: number; unit: string };
  onOpenShare: () => void;
}) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  };

  return (
    <div className="space-y-2">
      {/* Horizontal Carousel */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Slide 1: Weekly Highlight Banner */}
        <div onClick={onOpenShare} className="snap-center shrink-0 w-[88%] sm:w-[320px] rounded-2xl relative overflow-hidden h-44 bg-card border border-border flex flex-col justify-between p-4 group select-none cursor-pointer">
          <img src="/images/banner1.webp" alt="Highlight" className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Flame size={11} className="text-amber-400 fill-amber-400" />
              Weekly Summary
            </span>
            <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Share2 size={10} /> Share
            </span>
          </div>

          <div className="relative z-10">
            <h3 className="text-base font-bold text-white leading-tight">{streaks.current > 0 ? `${streaks.current} Day Active Streak` : 'Start Your Habit Stream'}</h3>
            <p className="text-xs text-white/80 mt-1 line-clamp-1">{monthCount} activities logged this month</p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
              <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                <Trophy size={13} /> Best: {streaks.longest} days
              </span>
              <span className="text-xs font-semibold text-white flex items-center gap-0.5 hover:underline">
                Share Card <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* Slide 2: Top Active Category */}
        <div className="snap-center shrink-0 w-[88%] sm:w-[320px] rounded-2xl relative overflow-hidden h-44 bg-card border border-border flex flex-col justify-between p-4 group select-none cursor-pointer">
          <img src="/images/banner2.webp" alt="Category highlight" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Target size={11} className="text-emerald-400" />
              Top Focus
            </span>
            <span className="text-[10px] text-white/70">Category</span>
          </div>

          <div className="relative z-10">
            {topCategory ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${topCategory.color}35` }}>
                    {(() => {
                      const IconComponent = getIcon(topCategory.icon);
                      return <IconComponent size={13} style={{ color: topCategory.color }} />;
                    })()}
                  </div>
                  <h3 className="text-base font-bold text-white truncate">{topCategory.name}</h3>
                </div>
                <p className="text-xs text-white/80">
                  Logged {topCategory.count} times this month {getUnit(topCategory.unit) ? `(${getUnit(topCategory.unit)})` : ''}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-white">Explore Categories</h3>
                <p className="text-xs text-white/80 mt-1">Set up custom habits & activities to track</p>
              </>
            )}

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
              <span className="text-xs text-white/70">Quick log ready</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/log');
                }}
                className="text-xs font-semibold text-white bg-accent/90 hover:bg-accent px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                Log now
              </button>
            </div>
          </div>
        </div>

        {/* Slide 3: Today's Habit Progress */}
        <div className="snap-center shrink-0 w-[88%] sm:w-[320px] rounded-2xl relative overflow-hidden h-44 bg-linear-to-br from-card via-surface to-card border border-border flex flex-col justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">Today's Goal</span>
            <span className="text-xs font-bold text-foreground">
              {todayLoggedCount} / {categoriesCount} Logged
            </span>
          </div>

          <div>
            <p className="text-xs text-muted mb-1.5">Daily Completion</p>
            <div className="w-full bg-surface border border-border h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500"
                style={{
                  width: `${categoriesCount > 0 ? Math.min(100, (todayLoggedCount / categoriesCount) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-muted mt-2">
              {todayLoggedCount === 0 ? 'No activities logged today yet' : todayLoggedCount === categoriesCount ? 'All categories logged for today!' : `${categoriesCount - todayLoggedCount} more to complete today`}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[11px] text-muted">Keep building your stream</span>
            <button onClick={() => navigate('/log')} className="text-xs font-semibold text-accent hover:underline cursor-pointer">
              Add entry →
            </button>
          </div>
        </div>
      </div>

      {/* Indicator dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-5 bg-accent' : 'w-1.5 bg-border'}`} />
        ))}
      </div>
    </div>
  );
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

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login');
  }, [navigate]);

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
