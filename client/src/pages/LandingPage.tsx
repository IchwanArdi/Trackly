import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarDays, ShieldCheck, Sparkles, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboard from '../assets/image.webp';
import categories from '../assets/categories.webp';
import logActivity from '../assets/log-activity.webp';
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
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Navbar({ onInstallClick }: InstallButtonProps) {
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-border bg-background/90 backdrop-blur-sm' : 'border-b border-transparent bg-transparent'}`}>
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" id="nav-logo" className="flex items-center gap-2.5">
          <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-8 w-8" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Trackly</span>
        </a>

        {isLoggedIn && (
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/dashboard" id="nav-dashboard" className="text-sm transition-colors rounded-lg bg-accent/90 hover:bg-accent px-2 py-1 font-medium text-white">
              Dashboard
            </Link>
            <button onClick={handleLogout} id="nav-logout" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
              Logout
            </button>
          </div>
        )}
        {!isLoggedIn && (
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/login" id="nav-features" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
              Login
            </Link>
            <button onClick={onInstallClick} id="nav-download" className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:text-accent">
              Download App
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

function Hero({ onInstallClick }: InstallButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScroll({ target: ref, offset: ['start start', 'end start'] });

  return (
    <section ref={ref} id="hero" className="relative overflow-hidden px-4 pt-28 sm:px-6 sm:pt-32 lg:px-8 pb-10 lg:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-muted">Track what matters</div>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">A cleaner way to follow your habits.</h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">Track routines, build consistency, and keep your progress easy to understand without noise.</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={onInstallClick} id="hero-cta-primary" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:text-accent">
              Download App
              <ArrowRight size={16} />
            </button>
            <Link to="/register" id="hero-cta-secondary" className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-muted transition hover:text-foreground">
              Create account
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <div className="group relative mx-auto flex max-w-[340px] items-start justify-center py-6 sm:max-w-md">
            {/* Ambient glow — anchors the device cluster */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl sm:h-64 sm:w-64" />

            {/* Left phone — categories */}
            <div className="absolute left-0 top-11 w-[36%] -rotate-[10deg] rounded-[1.5rem] border border-border bg-background p-1.5 opacity-80 transition-transform duration-500 ease-out group-hover:-translate-x-1.5 group-hover:-rotate-[6deg] sm:top-14">
              <div className="overflow-hidden rounded-[1.05rem] border border-border">
                <img src={pic3} alt="Trackly categories preview" className="block aspect-[9/19.5] w-full object-cover object-top" />
              </div>
            </div>

            {/* Right phone — activity history */}
            <div className="absolute right-0 top-11 w-[36%] rotate-[10deg] rounded-[1.5rem] border border-border bg-background p-1.5 opacity-80 transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:rotate-[6deg] sm:top-14">
              <div className="overflow-hidden rounded-[1.05rem] border border-border">
                <img src={pic1} alt="Trackly activity history preview" className="block aspect-[9/19.5] w-full object-cover object-top" />
              </div>
            </div>

            {/* Center phone — dashboard (hero device) */}
            <div className="relative z-10 w-[46%] rounded-[1.75rem] border border-border bg-background p-1.5 transition-transform duration-500 ease-out group-hover:-translate-y-1">
              <div className="absolute left-1/2 top-3 z-20 h-1.5 w-9 -translate-x-1/2 rounded-full bg-border" />
              <div className="overflow-hidden rounded-[1.35rem] border border-border">
                <img src={pic2} alt="Trackly dashboard preview" className="block aspect-[9/19.5] w-full object-cover object-top" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Marquee scrolling strip ─────────────────────────────────────
const ACTIVITIES = ['Morning Run', 'Reading', 'Meditation', 'Workout', 'Journaling', 'Walking', 'Cycling', 'Sleep', 'Stretching', 'Study', 'Swimming', 'Yoga', 'Cooking', 'Language Practice', 'Cold Shower'];

function Marquee() {
  const doubled = [...ACTIVITIES, ...ACTIVITIES];
  return (
    <div className="relative w-full overflow-hidden border-y border-border py-5">
      <div className="flex w-max animate-marquee items-center">
        {doubled.map((act, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 whitespace-nowrap px-7 text-sm font-medium text-foreground">
            <Activity size={16} className="shrink-0 text-accent" />
            {act}
            <span className="ml-7 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
          </span>
        ))}
      </div>
    </div>
  );
}

function IntroSection() {
  const points = [
    {
      number: '01',
      title: 'Quiet by design',
      description: 'No clutter, no noise, and no pressure to overthink your routine.',
    },
    {
      number: '02',
      title: 'Clear enough to trust',
      description: 'Your log becomes a simple record of what mattered and how it changed over time.',
    },
    {
      number: '03',
      title: 'Easy to come back to',
      description: 'The experience stays light so consistency feels natural instead of forced.',
    },
  ];

  const [active, setActive] = useState(0);

  return (
    <section className="px-4 pb-2 pt-4 md:pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">Why it feels different</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">A place for your routines that stays calm and useful.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">Trackly is built to help you return to the things that matter without making the process feel heavy.</p>

            {/* Big number preview — visible from tablet up */}
            <div className="mt-8 hidden md:block">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl font-semibold tracking-[-0.04em] text-border lg:text-7xl"
              >
                {points[active].number}
              </motion.div>
            </div>
          </div>

          <div className="relative space-y-0">
            {points.map((item, index) => {
              const isActive = index === active;
              return (
                <div key={item.title} className="relative">
                  {index !== points.length - 1 && <div className="absolute left-[19px] top-[42px] h-full w-px bg-border" />}

                  <button
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    className="group relative flex w-full items-start gap-4 rounded-[18px] px-2 py-4 text-left transition-colors duration-300"
                  >
                    <span
                      className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-300 ${isActive ? 'border-accent bg-accent text-white' : 'border-border bg-background text-muted'
                        }`}
                    >
                      {item.number}
                    </span>

                    <div className="pt-1.5">
                      <div className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted'}`}>{item.title}</div>
                      <motion.p
                        initial={false}
                        animate={{ opacity: isActive ? 1 : 0.55 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1 text-sm leading-6 text-muted"
                      >
                        {item.description}
                      </motion.p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const highlights = [
    {
      title: 'Build a system that feels effortless',
      description: 'Create categories for work, wellness, learning, and everything else then let Trackly turn your routine into a visual story.',
      image: categories,
      alt: 'Categories view preview',
      icon: <BarChart3 size={16} />,
    },
    {
      title: 'Log in seconds, not minutes',
      description: 'One touch, one note, one clear record. The experience stays fast so your momentum never breaks.',
      image: logActivity,
      alt: 'Activity logging preview',
      icon: <Zap size={16} />,
    },
  ];

  const pillars = [
    {
      title: 'Live heatmaps',
      description: 'See pattern and intensity at a glance.',
      icon: <CalendarDays size={16} />,
    },
    {
      title: 'Streak motivation',
      description: 'Stay aware of your best and current streaks.',
      icon: <Sparkles size={16} />,
    },
    {
      title: 'Clean history',
      description: 'Review every entry with clarity and context.',
      icon: <ShieldCheck size={16} />,
    },
  ];

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-accent">How it works</p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mx-auto mt-4 max-w-2xl text-center text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">Minimal by design. Powerful in practice.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-muted sm:text-base">Every surface is made to reduce noise and make your progress feel obvious.</p>
        </Reveal>

        {/* Dashboard — hero showcase paired with the feature pillars */}
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <Reveal delay={0.08}>
            <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background">
              <div className="border-b border-border p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  <Activity size={14} />
                  Your day, at a glance
                </span>
                <h3 className="mt-3 text-lg font-medium text-foreground sm:text-xl">Every habit, one dashboard.</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted">Progress, streaks, and trends the moment you open the app, no digging required.</p>
              </div>
              <div className="flex flex-1 items-end p-3 sm:p-4">
                <div className="w-full overflow-hidden">
                  <img
                    src={dashboard}
                    alt="Trackly dashboard overview"
                    className="block w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="flex h-full flex-col divide-y divide-border rounded-3xl border border-border bg-background">
              {pillars.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-6">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-accent">
                    {item.icon}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Supporting features */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {highlights.map((item, index) => (
            <Reveal key={item.title} delay={0.18 + index * 0.06}>
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-background">
                <div className="p-6 sm:p-7">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-accent">
                    {item.icon}
                  </span>
                  <div className="mt-4 text-sm font-medium text-foreground">{item.title}</div>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{item.description}</p>
                </div>
                <div className="mt-auto p-3 pt-0 sm:p-4 sm:pt-0">
                  <div className="overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="block w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreCTASection() {
  const cards = [
    {
      quote: 'Built so the smallest entry still feels worth logging.',
      label: 'Design principle',
      sublabel: 'Low friction by default',
      bg: 'bg-[#dbe7fb]',
      text: 'text-[#0a0a0a]',
      sub: 'text-[#0a0a0a]/60',
    },
    {
      quote: 'Consistency should be visible, not something you have to guess at.',
      label: 'Design principle',
      sublabel: 'Progress, made obvious',
      bg: 'bg-[#e3f24b]',
      text: 'text-[#0a0a0a]',
      sub: 'text-[#0a0a0a]/60',
    },
  ];

  return (
    <section className="px-4 pb-4 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-1 sm:gap-3 sm:grid-cols-[1.4fr_1fr]">
          {cards.map((card, index) => (
            <div key={index} className={`flex flex-col justify-between h-fit md:h-100 overflow-hidden rounded-lg ${card.bg} p-8 sm:p-10`}>
              <p className={`relative text-xl font-medium leading-snug sm:text-2xl ${card.text}`}>
                &ldquo;<i>{card.quote}</i>&rdquo;
              </p>

              <div className=" mt-16 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10">
                  <Activity size={14} className={card.text} />
                </div>
                <div>
                  <div className={`text-sm font-medium ${card.text}`}>{card.label}</div>
                  <div className={`text-xs ${card.sub}`}>{card.sublabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-sm text-muted">
            Built for people who want <span className="font-semibold text-foreground">one calm place</span> to see their habits add up.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onInstallClick }: InstallButtonProps) {
  return (
    <section id="download" className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-border px-6 py-12 text-center sm:px-10">
        <Reveal delay={0.06}>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">Start tracking with less friction.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">Bring your routines into one calm place. Build consistency, and let the progress speak for itself.</p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={onInstallClick} id="final-cta-download" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:text-accent">
              Download App
              <ArrowRight size={16} />
            </button>
            <Link to="/register" className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-muted transition hover:text-foreground">
              Create your account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-8 w-8" />
            <div>
              <div className="text-sm font-semibold text-foreground">Trackly</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted md:justify-end">
          <Link to="/login" className="transition hover:text-foreground">
            Sign in
          </Link>
          <Link to="/register" className="transition hover:text-foreground">
            Register
          </Link>
          <a href="#download" className="transition hover:text-foreground">
            Download
          </a>
          <Link to="/help" className="transition hover:text-foreground">
            Help
          </Link>
          <Link to="/privacy-policy" className="transition hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms-of-service" className="transition hover:text-foreground">
            Terms of Service
          </Link>
        </div>

        <p className="text-center text-sm text-muted md:text-right">
          © {new Date().getFullYear()} Trackly
          <span className="mt-1 block sm:mt-0 sm:ml-1 sm:inline">Built to build habits.</span>
        </p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      window.alert('Install prompt is not available yet. Open this app in a PWA-supported browser (Chrome/Edge) and ensure the site is running on HTTPS or localhost.');
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${choiceResult.outcome}`);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onInstallClick={handleInstallClick} />
      <Hero onInstallClick={handleInstallClick} />
      <Marquee />
      <IntroSection />
      <Features />
      <PreCTASection />
      <FinalCTA onInstallClick={handleInstallClick} />
      <Footer />
    </div>
  );
}
