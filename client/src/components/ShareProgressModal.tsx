import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Sparkles, Flame, TrendingUp, Layers, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUser } from '../utils/auth';
import { renderIcon } from '../utils/icons';
import { getUnit } from '../utils/format';
import { format } from 'date-fns';

export interface ShareCategoryData {
  id?: string;
  name: string;
  unit: string;
  color: string;
  icon: string;
}

export interface ShareTopCategoryData {
  name: string;
  value: number;
  unit: string;
  color: string;
}

export interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  category?: ShareCategoryData | null;
  topCategory?: ShareTopCategoryData | null;
  stats: {
    totalValue?: number | string;
    totalLogs: number;
    streakDays: number;
    periodLabel: string;
    categoriesCount?: number;
  };
}

export function ShareProgressModal({ isOpen, onClose, title = 'Activity Stream Summary', category, topCategory, stats }: ShareProgressModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const user = getUser();
  const todayStr = format(new Date(), 'MMM d, yyyy');

  const categoryIcon = category?.icon;
  const accentColor = category?.color || '#e85d04';
  const cleanUnit = useMemo(() => (category ? getUnit(category.unit) : null), [category]);

  if (!isOpen) return null;

  const isCategoryShare = Boolean(category);

  // Generate share text for native share & clipboard
  const shareText = isCategoryShare
    ? `Logged ${stats.totalValue} ${cleanUnit || ''} on ${category?.name} with Trackly! 🔥 Streak: ${stats.streakDays} days.`
    : `Completed ${stats.totalLogs} activity sessions on Trackly! 🔥 Streak: ${stats.streakDays} days.`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `trackly-progress-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Card image saved to your device!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image card');
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'trackly-progress.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: isCategoryShare ? `${category?.name} Progress` : 'My Trackly Summary',
          text: shareText,
          files: [file],
        });
      } else {
        await handleDownload();
        await navigator.clipboard.writeText(shareText);
        toast.info('Summary text copied to clipboard!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not share directly');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isCategoryShare ? `Share ${category?.name} Card` : 'Share Progress Card'}
        className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-xs font-semibold text-foreground">{isCategoryShare ? `Share ${category?.name} Card` : 'Share Progress Card'}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Strava/Spotify Wrapped Style Share Card */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl p-6 text-white select-none shadow-2xl flex flex-col justify-between"
            style={{
              minHeight: '360px',
              background: `linear-gradient(145deg, #12141a 0%, #1a1e29 50%, ${accentColor}35 100%)`,
              border: `1.5px solid ${accentColor}40`,
            }}
          >
            {/* Top Brand & Date */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <img src="/trackly-icon.webp" alt="Trackly Icon" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-white/90">TRACKLY</span>
              </div>
              <span className="text-[10px] text-white/60 font-medium">{todayStr}</span>
            </div>

            {/* Middle Main Metric */}
            <div className="my-5 z-10">
              {/* Category or Global Title */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}30` }}>
                  {renderIcon(categoryIcon ?? 'Flame', { size: 16, style: { color: accentColor } })}
                </div>
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">{category?.name || title}</span>
              </div>

              {/* Display metric based on share type */}
              {isCategoryShare ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tabular-nums tracking-tight leading-none">{typeof stats.totalValue === 'number' ? stats.totalValue.toLocaleString() : (stats.totalValue ?? 0)}</span>
                    {cleanUnit && <span className="text-base text-white/70 font-medium">{cleanUnit}</span>}
                  </div>
                  <p className="text-xs text-white/60 mt-1.5 font-medium">{stats.periodLabel}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tabular-nums tracking-tight leading-none">{stats.totalLogs.toLocaleString()}</span>
                    <span className="text-base text-white/70 font-medium">Sessions</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1.5 font-medium">{stats.periodLabel}</p>

                  {/* Top Category Highlight Banner if overall summary */}
                  {topCategory && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
                      <Award size={13} className="text-amber-400 shrink-0" />
                      <span className="text-[11px] text-white/90">
                        Top Focus: <strong className="text-white">{topCategory.name}</strong> ({topCategory.value.toLocaleString()} {getUnit(topCategory.unit)})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Stats Grid & User Watermark */}
            <div className="pt-4 border-t border-white/15 z-10 space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/60 uppercase font-semibold">Streak</p>
                    <p className="text-xs font-bold text-white">{stats.streakDays} Days</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCategoryShare ? (
                    <>
                      <TrendingUp size={16} className="text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Total Logs</p>
                        <p className="text-xs font-bold text-white">{stats.totalLogs} Times</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Layers size={16} className="text-sky-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-white/60 uppercase font-semibold">Categories</p>
                        <p className="text-xs font-bold text-white">{stats.categoriesCount ?? 1} Active</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* User watermark */}
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span className="font-semibold text-white truncate max-w-37.5">@{user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'trackly_user'}</span>
                <span className="text-white/50 text-[10px]">trackly.app</span>
              </div>
            </div>


          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-semibold bg-surface border border-border text-foreground hover:bg-card active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              {downloading ? 'Exporting…' : 'Save Image'}
            </button>

            <button
              onClick={handleNativeShare}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Share2 size={14} />
              Share Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
