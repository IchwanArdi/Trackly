/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Workbench · tone: calm-focused · anchor hue: orange · nav: N5 · footer: Ft1 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Activity, Download, Layers, ChevronRight } from 'lucide-react';
import { format, subDays } from 'date-fns';
import pic1 from '../assets/pic1.webp';
import pic2 from '../assets/pic2.webp';
import pic3 from '../assets/pic3.webp';
import { clearAuthToken, api } from '../utils/auth';
import { useAuthStatus } from '../utils/useAuthStatus';
import { useData, type Entry } from '../store/dataStore';
import { ContributionHeatmap } from '../components/dashboard/ContributionHeatmap';

// Hormati preferensi aksesibilitas: kalau user minta reduced motion, semua animasi
// (auto-rotate tour, count-up, isi heatmap bertahap) langsung tampil versi final.
const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface InstallButtonProps {
  onInstallClick: () => void;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FloatingNavbar({ onInstallClick }: InstallButtonProps) {
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = useAuthStatus();
  const { clearData } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthToken();
    clearData();
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 transition-all duration-300">
      <nav
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 ${scrolled ? 'border-border bg-background/95 shadow-md backdrop-blur-md' : 'border-border/60 bg-card/80 backdrop-blur-xs'
          }`}
      >
        <Link to="/" id="nav-logo" className="flex items-center gap-2.5 pl-1">
          <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-7 w-7 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Trackly</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              id="nav-dashboard"
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              id="nav-logout"
              className="px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-border rounded-full"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              id="nav-login"
              className="px-3.5 py-1.5 text-xs font-medium text-muted transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-border rounded-full"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              id="nav-register"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-medium text-foreground border border-border rounded-full transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-border"
            >
              Create account
            </Link>
            <button
              onClick={onInstallClick}
              id="nav-download"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Get App</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

function WorkbenchHero({ onInstallClick }: InstallButtonProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'log'>('dashboard');
  const [tourPaused, setTourPaused] = useState(false);
  const [tourStopped, setTourStopped] = useState(false);

  // Auto-putar guided tour: tab berganti tiap 4,5 detik sampai user memilih manual.
  // Berhenti sementara saat hover/disentuh, dan hormati prefers-reduced-motion.
  useEffect(() => {
    if (tourPaused || tourStopped || PREFERS_REDUCED_MOTION) return;

    const timer = setInterval(() => {
      setActiveTab((prev) => (prev === 'dashboard' ? 'categories' : prev === 'categories' ? 'log' : 'dashboard'));
    }, 4500);

    return () => clearInterval(timer);
  }, [tourPaused, tourStopped]);

  const screenshots = {
    dashboard: {
      img: pic2,
      alt: 'Trackly Dashboard Overview',
      title: 'Daily Heatmaps & Progress',
      desc: 'View consistent completion trends across all your daily habit categories at a glance.',
    },
    categories: {
      img: pic3,
      alt: 'Trackly Category System',
      title: 'Custom Habit Categories',
      desc: 'Organize routines with tailored icons, color schemes, and target numeric increments.',
    },
    log: {
      img: pic1,
      alt: 'Trackly Rapid Activity Log',
      title: 'Rapid Frictionless Logging',
      desc: 'Log activities in seconds with quick increment controls and optional notes.',
    },
  };

  return (
    <section id="hero" className="relative overflow-x-clip px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-36 lg:pb-24">
      <div className="mx-auto max-w-5xl">
        {/* Header content */}
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>PERSONAL ACTIVITY TRACKER</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.15]">
            Build calm routines. Observe steady progress.
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted max-w-2xl">
            Trackly is a distraction-free workspace designed to record daily habits, observe momentum, and stay consistent without gamified noise.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onInstallClick}
              id="hero-cta-primary"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span>Download App</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/register"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-border"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              <span>Sign in</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Workbench Guided Tour Showcase */}
        <div
          className="mt-14"
          onMouseEnter={() => setTourPaused(true)}
          onMouseLeave={() => setTourPaused(false)}
          onTouchStart={() => setTourStopped(true)}
        >
          <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto pb-3 border-b border-border [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setTourStopped(true);
              }}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${activeTab === 'dashboard'
                ? 'bg-foreground text-background font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
            >
              01 · Dashboard & Heatmap
            </button>
            <button
              onClick={() => {
                setActiveTab('categories');
                setTourStopped(true);
              }}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${activeTab === 'categories'
                ? 'bg-foreground text-background font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
            >
              02 · Custom Categories
            </button>
            <button
              onClick={() => {
                setActiveTab('log');
                setTourStopped(true);
              }}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${activeTab === 'log'
                ? 'bg-foreground text-background font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
            >
              03 · Rapid Activity Logging
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <figure className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm">
                <img
                  src={screenshots[activeTab].img}
                  alt={screenshots[activeTab].alt}
                  className="w-full h-auto rounded-xl object-cover object-top max-h-[520px]"
                />
              </figure>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-center space-y-4 lg:py-6">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground font-mono text-xs font-bold">
                {activeTab === 'dashboard' ? '01' : activeTab === 'categories' ? '02' : '03'}
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">{screenshots[activeTab].title}</h3>
              <p className="text-sm text-muted leading-relaxed">{screenshots[activeTab].desc}</p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <span>Try this view in Trackly</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemPrinciples() {
  const principles = [
    {
      num: '01',
      title: 'Low friction by default',
      desc: 'Log activities in seconds with numerical increments, custom units (minutes, liters, pages), or simple completion toggles.',
    },
    {
      num: '02',
      title: 'No gamified anxiety',
      desc: 'Focus on clear activity timelines and heatmaps rather than punitive streak resets or intrusive notifications.',
    },
    {
      num: '03',
      title: 'Private & accessible',
      desc: 'Built as an installable app with local responsiveness and instant search across your entire activity history.',
    },
  ];

  return (
    <section className="border-t border-border bg-card/40 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-8 text-xs font-mono font-medium text-muted uppercase tracking-wider">Design Principles</div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {principles.map((item, idx) => (
            <Reveal key={item.num} delay={idx * 0.1}>
              <div className="border-l-2 border-border pl-5 py-1">
                <span className="font-mono text-xs font-bold text-accent">{item.num}</span>
                <h3 className="mt-2 text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityGrid() {
  return (
    <section className="border-t border-border py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Everything required to sustain your daily routine.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted">
              Thoughtful utility crafted specifically for personal tracking without fluff.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Tailored Category Specs</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Define your own categories with custom icons, color tags, and unit types (e.g. Hours, Pages, Sets, Glass).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-muted">
                Custom Units · Color Codings · Icon Picker
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Visual Heatmaps & Trends</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Understand your long-term consistency through visual heatmaps, monthly aggregate totals, and period filters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-muted">
                7-Day · 30-Day · All Time · Annual Heatmap
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
                  <Activity className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Shareable Milestone Summaries</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Export clean, high-resolution image cards of your milestone streaks and progress to keep yourself accountable.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-muted">
                Clean PNG Export · Custom Accent Themes
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Installable PWA</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Install Trackly straight to your phone's home screen — it opens fullscreen like a native app, with the app shell cached for instant loads.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-muted">
                Web App Manifest · Home Screen Install
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ConversationalFAQ() {
  const faqs = [
    {
      q: 'Is Trackly free to use?',
      a: 'Yes. Trackly is completely free for personal activity and habit tracking — no premium tiers, no ads.',
    },
    {
      q: 'How do I install Trackly on my mobile phone?',
      a: 'Click the "Get App" or "Download App" button in the navigation header. On iOS or Android, select "Add to Home Screen" to install Trackly as a Progressive Web App (PWA).',
    },
    {
      q: 'Can I track habits with custom units like minutes or liters?',
      a: 'Yes. Every category can be customized with specific target units (e.g. Minutes, Pages, Cups, Km) or left as a simple checkmark.',
    },
    {
      q: 'Can I sign in with Google?',
      a: 'Yes. You can create an account with an email and password, or sign in instantly with your Google account.',
    },
    {
      q: 'Can I use Trackly on multiple devices?',
      a: 'Yes. Your data is tied to your account, so you can log activities on your phone and review your progress on your laptop — everything stays in sync.',
    },
    {
      q: 'Is my activity data private?',
      a: 'Your entries are only accessible when signed in with your account credentials. Your personal data is never sold or shared.',
    },
    {
      q: 'Can I delete my data?',
      a: 'Yes. You can delete individual entries anytime, or permanently remove your entire account and all associated data from your profile — no questions asked.',
    },
    {
      q: 'Does Trackly work offline?',
      a: 'After installing, the app shell is cached so Trackly opens instantly, even on a weak connection. Logging and syncing need an internet connection so your data stays safely stored with your account.',
    },
  ];

  return (
    <section className="border-t border-border bg-card/30 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">Common Questions</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
        </Reveal>

        <div className="mt-10 divide-y divide-border">
          {faqs.map((faq, idx) => (
            <Reveal key={faq.q} delay={idx * 0.08}>
              <div className="py-6">
                <h3 className="text-base font-bold text-foreground flex items-start gap-3">
                  <span className="font-mono text-xs text-accent mt-0.5">Q0{idx + 1}</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed pl-8">{faq.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction({ onInstallClick }: InstallButtonProps) {
  return (
    <section id="download" className="border-t border-border py-20 px-4 sm:px-6 lg:px-8">
      {/* Kartu CTA orange — satu-satunya blok orange penuh di halaman sebagai penutup.
          Motif: titik-titik ala heatmap (fade ke tepi) + glow lembut, semuanya dekoratif. */}
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent via-[#d14e00] to-[#a83a00] p-8 sm:p-12 text-center">
        {/* Motif titik heatmap */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 78%)',
          }}
        />
        {/* Glow lembut dua sudut untuk dimensi */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-black/20 blur-3xl" />

        <Reveal>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Start building your routine today.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
              Join a cleaner, focused activity tracker. Free, fast, and installable on all your devices.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onInstallClick}
                id="cta-download"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-accent transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Download className="h-4 w-4" />
                <span>Download App</span>
              </button>
              <Link
                to="/register"
                id="cta-register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Create Account
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MastheadFooter() {
  return (
    <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <img src="/trackly-icon.webp" alt="Trackly Logo" className="h-7 w-7 rounded-lg" />
            <span className="text-base font-bold text-foreground tracking-tight">Trackly</span>
            <span className="text-xs font-mono text-muted pl-2 border-l border-border">v1.0</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted">
            <Link to="/login" id="footer-login" className="hover:text-foreground transition">
              Sign in
            </Link>
            <Link to="/register" id="footer-register" className="hover:text-foreground transition">
              Create account
            </Link>
            <a href="#download" id="footer-download" className="hover:text-foreground transition">
              Download
            </a>
            <Link to="/privacy-policy" id="footer-privacy" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" id="footer-terms" className="hover:text-foreground transition">
              Terms of Service
            </Link>
            <Link to="/data-deletion" id="footer-data-deletion" className="hover:text-foreground transition">
              Data Deletion
            </Link>
            <Link to="/help" id="footer-help" className="hover:text-foreground transition">
              Help
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} Trackly. Personal Activity & Routine Tracking.</p>
          <p className="font-mono text-[11px]">Crafted for calm consistency.</p>
        </div>
      </div>
    </footer>
  );
}

function ActivityMarquee() {
  const activities = [
    { label: 'Reading', val: '30 pgs', color: 'bg-amber-500' },
    { label: 'Meditation', val: '15 mins', color: 'bg-emerald-500' },
    { label: 'Workout', val: '45 mins', color: 'bg-orange-500' },
    { label: 'Journaling', val: '1 entry', color: 'bg-indigo-500' },
    { label: 'Walking', val: '8,000 steps', color: 'bg-blue-500' },
    { label: 'Cycling', val: '12 km', color: 'bg-cyan-500' },
    { label: 'Sleep', val: '8.0 hrs', color: 'bg-purple-500' },
    { label: 'Stretching', val: '10 mins', color: 'bg-teal-500' },
    { label: 'Study', val: '2.5 hrs', color: 'bg-rose-500' },
    { label: 'Swimming', val: '20 laps', color: 'bg-sky-500' },
  ];

  const items = [...activities, ...activities, ...activities, ...activities];

  return (
    <div className="w-full border-y border-border bg-card/40 py-4 overflow-hidden select-none">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] gap-3">
        {items.map((act, idx) => (
          <div
            key={`${act.label}-${idx}`}
            className="inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-card px-4 py-1.5 text-xs font-mono text-foreground shadow-xs shrink-0 hover:border-accent/40 transition"
          >
            <span className={`h-2 w-2 rounded-full ${act.color}`} />
            <span className="font-semibold text-foreground">{act.label}</span>
            <span className="text-muted border-l border-border/60 pl-2.5 text-[11px] font-mono">{act.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── At a Glance: angka publik asli, dengan fallback fakta produk ──
interface PublicStats {
  users: number;
  entries: number;
  categories: number;
}

// Angka statistik hanya ditampilkan kalau sudah cukup besar untuk meyakinkan.
// Kalau masih kecil (atau endpoint belum tersedia), tampilkan fakta produk — tanpa angka bohongan.
const STATS_MIN_ENTRIES = 100;
const STATS_MIN_USERS = 5;

function useCountUp(target: number, active: boolean, duration = 1300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target <= 0 || PREFERS_REDUCED_MOTION) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  if (PREFERS_REDUCED_MOTION) return active ? target : 0;
  return value;
}

function LiveStatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: PublicStats }>('/api/stats/public')
      .then((res) => {
        if (!cancelled) setStats(res.data?.data ?? null);
      })
      .catch(() => {
        // Endpoint belum tersedia / offline — versi fallback di bawah yang tampil
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showRealNumbers =
    !!stats && stats.entries >= STATS_MIN_ENTRIES && stats.users >= STATS_MIN_USERS;

  const entriesCount = useCountUp(showRealNumbers ? stats?.entries ?? 0 : 0, inView);
  const categoriesCount = useCountUp(showRealNumbers ? stats?.categories ?? 0 : 0, inView);
  const usersCount = useCountUp(showRealNumbers ? stats?.users ?? 0 : 0, inView);

  return (
    <section ref={ref} className="bg-card/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center text-xs font-mono font-medium text-muted uppercase tracking-wider mb-6">
          At a Glance
        </div>

        {showRealNumbers ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">{entriesCount.toLocaleString()}</p>
              <p className="mt-1.5 text-xs font-mono text-muted uppercase tracking-wider">activities logged</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">{categoriesCount.toLocaleString()}</p>
              <p className="mt-1.5 text-xs font-mono text-muted uppercase tracking-wider">routine categories created</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">{usersCount.toLocaleString()}</p>
              <p className="mt-1.5 text-xs font-mono text-muted uppercase tracking-wider">people building routines</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {['100% free', 'No ads, no noise', 'Installable PWA', 'Delete your data anytime'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 text-xs font-mono text-muted">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── How It Works: cerita 3 langkah pemakaian ─────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Create a category',
      desc: 'Pick an icon, a color, and a unit — pages, minutes, km, or anything you count.',
    },
    {
      num: '02',
      title: 'Log in seconds',
      desc: 'One tap records today\'s progress. Add a note if you feel like it, then move on with your day.',
    },
    {
      num: '03',
      title: 'Watch momentum build',
      desc: 'Heatmaps, streaks, and monthly totals fill in over time — quiet proof that you keep showing up.',
    },
  ];

  return (
    <section className="border-t border-border py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">How It Works</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Three steps. Then just repeat.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <Reveal key={step.num} delay={idx * 0.08}>
              <div className="rounded-2xl border border-border bg-card p-6 h-full">
                <span className="font-mono text-xs font-bold text-accent">{step.num}</span>
                <h3 className="mt-3 text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Live heatmap demo: komponen heatmap asli dengan data contoh ──
// Data contoh deterministik (bukan data user asli). Probabilitas hari terisi makin
// tinggi di hari-hari terakhir — biar terlihat seperti momentum yang terbangun.
function buildDemoEntries(): Entry[] {
  const entries: Entry[] = [];
  const today = new Date();
  let seed = 20251017;

  const nextRandom = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const date = subDays(today, daysAgo);
    const fillChance = 0.5 + 0.4 * (1 - daysAgo / 90);

    if (nextRandom() < fillChance) {
      const count = 1 + Math.floor(nextRandom() * 4); // 1–4 entry per hari
      for (let i = 0; i < count; i++) {
        entries.push({
          id: `demo-${daysAgo}-${i}`,
          categoryId: 'demo',
          date: format(date, 'yyyy-MM-dd'),
          value: 1,
        });
      }
    }
  }

  return entries;
}

function LiveHeatmapDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  const demoEntries = useMemo(() => buildDemoEntries(), []);
  const [visibleCount, setVisibleCount] = useState(0);

  // Isi heatmap bertahap dari hari terbaru ke belakang begitu masuk viewport.
  useEffect(() => {
    if (!inView || PREFERS_REDUCED_MOTION) return;

    let raf = 0;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setVisibleCount(Math.round(demoEntries.length * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, demoEntries]);

  const displayEntries = PREFERS_REDUCED_MOTION ? demoEntries : demoEntries.slice(0, visibleCount);

  return (
    <section className="border-t border-border bg-card/30 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2">The Heart of Trackly</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                A living map of your consistency.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                Every logged day fills a cell — the deeper the color, the more active the day. Over weeks it becomes an honest picture of momentum, with no scores to game.
              </p>
              <div className="mt-6">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <span>Start your own map</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div ref={ref} className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-wider">Last 90 days</span>
                <span className="text-[10px] font-mono text-muted/70 uppercase tracking-wider">Demo data</span>
              </div>
              <ContributionHeatmap entries={displayEntries} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      const element = document.getElementById('download');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent font-sans antialiased overflow-x-clip">
      <FloatingNavbar onInstallClick={handleInstallClick} />
      <main id="main-content">
        <WorkbenchHero onInstallClick={handleInstallClick} />
        <ActivityMarquee />
        <LiveStatsBand />
        <HowItWorks />
        <SystemPrinciples />
        <LiveHeatmapDemo />
        <CapabilityGrid />
        <ConversationalFAQ />
        <CallToAction onInstallClick={handleInstallClick} />
      </main>
      <MastheadFooter />
    </div>
  );
}
