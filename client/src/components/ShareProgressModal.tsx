import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Sparkles, Flame, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUser } from '../utils/auth';
import { getIcon } from '../utils/icons';
import { formatUnit } from '../utils/format';
import { format } from 'date-fns';

interface ShareProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: {
    name: string;
    unit: string;
    color: string;
    icon: string;
  };
  stats: {
    totalValue: number;
    totalLogs: number;
    streakDays: number;
    periodLabel: string;
  };
}

export function ShareProgressModal({
  isOpen,
  onClose,
  title,
  category,
  stats,
}: ShareProgressModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const user = getUser();
  const todayStr = format(new Date(), 'MMM d, yyyy');

  if (!isOpen) return null;

  const CategoryIcon = category ? getIcon(category.icon) : Flame;
  const accentColor = category?.color || '#e85d04';
  const cleanUnit = formatUnit(category?.unit);

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
          title: 'My Trackly Progress',
          text: `Logged ${stats.totalValue} ${cleanUnit || 'entries'} on Trackly! 🔥 Streak: ${stats.streakDays} days.`,
          files: [file],
        });
      } else {
        // Fallback to image download + clipboard
        await handleDownload();
        await navigator.clipboard.writeText(
          `Logged ${stats.totalValue} ${cleanUnit || 'entries'} on Trackly! 🔥 Streak: ${stats.streakDays} days.`
        );
        toast.info('Summary copied to clipboard!');
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
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-xs font-semibold text-foreground">Share Progress Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4">

          {/* ── Strava/Spotify Wrapped Style Share Card ── */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl p-6 text-white select-none shadow-2xl flex flex-col justify-between"
            style={{
              minHeight: '360px',
              background: `linear-gradient(145deg, #12141a 0%, #1a1e29 50%, ${accentColor}30 100%)`,
              border: `1.5px solid ${accentColor}40`,
            }}
          >
            {/* Top Brand & Date */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  T
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-white/90">TRACKLY</span>
              </div>
              <span className="text-[10px] text-white/60 font-medium">{todayStr}</span>
            </div>

            {/* Middle Main Metric */}
            <div className="my-6 z-10">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${accentColor}30` }}
                >
                  <CategoryIcon size={16} style={{ color: accentColor }} />
                </div>
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                  {category?.name || title}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tabular-nums tracking-tight leading-none">
                  {stats.totalValue.toLocaleString()}
                </span>
                {cleanUnit && <span className="text-base text-white/70 font-medium">{cleanUnit}</span>}
              </div>

              <p className="text-xs text-white/60 mt-1.5 font-medium">{stats.periodLabel}</p>
            </div>

            {/* Bottom Stats Grid & User Profile */}
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
                  <TrendingUp size={16} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/60 uppercase font-semibold">Total Logs</p>
                    <p className="text-xs font-bold text-white">{stats.totalLogs} Times</p>
                  </div>
                </div>
              </div>

              {/* User watermark */}
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span className="font-semibold text-white truncate max-w-[150px]">
                  @{user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'trackly_user'}
                </span>
                <span className="text-white/50 text-[10px]">trackly.app</span>
              </div>
            </div>

            {/* Background Decorative Glow */}
            <div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ background: accentColor }}
            />
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
