import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { getIcon } from '../../utils/icons';
import { Share2, Flame, Trophy, ChevronRight, Target } from 'lucide-react';
import { getUnit } from '../../utils/format';

export default function HighlightsDeck({
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