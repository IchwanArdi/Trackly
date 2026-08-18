/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Workbench · tone: calm-focused · anchor hue: orange · nav: N5 · footer: Ft1 */
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Activity, Download, Layers, ChevronRight } from 'lucide-react';
import pic1 from '../assets/pic1.webp';
import pic2 from '../assets/pic2.webp';
import pic3 from '../assets/pic3.webp';
import { isAuthenticated, clearAuthToken } from '../utils/auth';
import { useData } from '../store/dataStore';

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
  const isLoggedIn = isAuthenticated();
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
        <div className="mt-14">
          <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto pb-3 border-b border-border [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${activeTab === 'dashboard'
                ? 'bg-foreground text-background font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
            >
              01 · Dashboard & Heatmap
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${activeTab === 'categories'
                ? 'bg-foreground text-background font-semibold'
                : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
            >
              02 · Custom Categories
            </button>
            <button
              onClick={() => setActiveTab('log')}
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
                <h3 className="text-lg font-bold text-foreground">PWA & Offline Readiness</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Install Trackly directly on your iOS or Android home screen for native-like performance and zero loading lag.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-muted">
                Web App Manifest · Fast PWA Shell
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
      a: 'Yes. Trackly is completely free for personal activity and habit tracking.',
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
      q: 'Where is my data stored?',
      a: 'Your session data is managed securely via JSON Web Tokens (JWT) with options to clear or export your activity log history anytime.',
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
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 sm:p-12 text-center">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Start building your routine today.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
            Join a cleaner, focused activity tracker. Free, fast, and installable on all your devices.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onInstallClick}
              id="cta-download"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Download className="h-4 w-4" />
              <span>Download App</span>
            </button>
            <Link
              to="/register"
              id="cta-register"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition hover:bg-border/40 focus-visible:ring-2 focus-visible:ring-border"
            >
              Create Account
            </Link>
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
        <SystemPrinciples />
        <CapabilityGrid />
        <ConversationalFAQ />
        <CallToAction onInstallClick={handleInstallClick} />
      </main>
      <MastheadFooter />
    </div>
  );
}
