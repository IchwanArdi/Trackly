import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll } from 'framer-motion';
import { ArrowRight, BarChart3, CalendarDays, ShieldCheck, Sparkles, Zap, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboard from '../assets/dashboard.webp';
import categories from '../assets/categories.webp';
import logActivity from '../assets/log-activity.webp';

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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

        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/register" id="nav-features" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
            Register
          </Link>
          <a href="#download" id="nav-download" className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:text-accent">
            Download App
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  useScroll({ target: ref, offset: ['start start', 'end start'] });

  return (
    <section ref={ref} id="hero" className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mb-5 text-[11px] font-medium uppercase tracking-[0.24em] text-muted">Track what matters</div>

          <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">A cleaner way to follow your habits.</h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">Track routines, build consistency, and keep your progress easy to understand without noise.</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#download" id="hero-cta-primary" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:text-accent">
              Download App
              <ArrowRight size={16} />
            </a>
            <Link to="/register" id="hero-cta-secondary" className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-muted transition hover:text-foreground">
              Create account
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <div className="rounded-3xl border border-border p-2">
            <img src={dashboard} alt="Trackly dashboard preview" className="block w-full rounded-[18px] border border-border" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: '50+', label: 'trackable activity types' },
    { value: '365', label: 'history days per category' },
    { value: '∞', label: 'custom categories' },
    { value: '1', label: 'calm home for your habits' },
  ];

  return (
    <section className="border-y border-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
        {stats.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.05}>
            <div className="rounded-2xl border border-border px-4 py-4 text-center">
              <div className="text-2xl font-semibold tracking-tight text-foreground">{item.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{item.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function IntroSection() {
  const points = [
    {
      title: 'Quiet by design',
      description: 'No clutter, no noise, and no pressure to overthink your routine.',
    },
    {
      title: 'Clear enough to trust',
      description: 'Your log becomes a simple record of what mattered and how it changed over time.',
    },
    {
      title: 'Easy to come back to',
      description: 'The experience stays light so consistency feels natural instead of forced.',
    },
  ];

  return (
    <section className="px-4 pb-2 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">Why it feels different</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">A place for your routines that stays calm and useful.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">Trackly is built to help you return to the things that matter without making the process feel heavy.</p>
          </div>

          <div className="space-y-3">
            {points.map((item) => (
              <div key={item.title} className="rounded-[18px] border border-border px-4 py-4">
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="mt-1 text-sm leading-6 text-muted">{item.description}</div>
              </div>
            ))}
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
      description: 'Create categories for work, wellness, learning, and everything else — then let Trackly turn your routine into a visual story.',
      image: categories,
      alt: 'Categories view preview',
      icon: <BarChart3 size={16} className="text-accent" />,
    },
    {
      title: 'Log in seconds, not minutes',
      description: 'One touch, one note, one clear record. The experience stays fast so your momentum never breaks.',
      image: logActivity,
      alt: 'Activity logging preview',
      icon: <Zap size={16} className="text-accent" />,
    },
  ];

  const pillars = [
    {
      title: 'Live heatmaps',
      description: 'See pattern and intensity at a glance.',
      icon: <CalendarDays size={16} className="text-accent" />,
    },
    {
      title: 'Streak motivation',
      description: 'Stay aware of your best and current streaks.',
      icon: <Sparkles size={16} className="text-accent" />,
    },
    {
      title: 'Clean history',
      description: 'Review every entry with clarity and context.',
      icon: <ShieldCheck size={16} className="text-accent" />,
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

        <div className="mt-12 space-y-6">
          {highlights.map((item, index) => (
            <Reveal key={item.title} delay={0.08 + index * 0.06}>
              <div className={`grid items-center gap-8 rounded-3xl border border-border p-5 sm:p-8 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div className="max-w-xl">
                  <div className="mb-4 text-sm font-medium text-muted">{item.title}</div>
                  <p className="text-sm leading-7 text-muted sm:text-base">{item.description}</p>
                </div>
                <div className="overflow-hidden rounded-[18px] border border-border p-2">
                  <img src={item.image} alt={item.alt} className="block w-full" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map((item, index) => (
            <Reveal key={item.title} delay={0.08 + index * 0.05}>
              <div className="rounded-lg border border-border p-5">
                <div className="mb-3 text-sm font-medium text-foreground">{item.title}</div>
                <p className="text-sm leading-6 text-muted">{item.description}</p>
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
          {cards.map((card) => (
            <div key={card.label} className={`flex flex-col justify-between h-fit md:h-[400px] overflow-hidden rounded-lg ${card.bg} p-8 sm:p-10`}>
              <p className={`relative text-xl font-medium leading-snug sm:text-2xl ${card.text}`}>&ldquo;<i>{card.quote}</i>&rdquo;</p>

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

function FinalCTA() {
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
            <a href="#" id="final-cta-download" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:text-accent">
              Download App
              <ArrowRight size={16} />
            </a>
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
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-8 w-8" />
          <span className="text-sm font-semibold text-foreground">Trackly</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted">
          <a href="/login" className="transition hover:text-foreground">
            Sign in
          </a>
          <a href="/register" className="transition hover:text-foreground">
            Register
          </a>
          <a href="#download" className="transition hover:text-foreground">
            Download
          </a>
          <a href="/help" className="transition hover:text-foreground">
            Help
          </a>
          <a href="/privacy-policy" className="transition hover:text-foreground">
            Privacy
          </a>
          <a href="/terms-of-service" className="transition hover:text-foreground">
            Terms of Service
          </a>
        </div>
        <p className="text-sm text-muted">© {new Date().getFullYear()} Trackly. Built to build habits.</p>
      </div>
    </footer >
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <StatsBar />
      <IntroSection />
      <Features />
      <PreCTASection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
