import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

// ── Scroll-reveal wrapper ────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 border-b border-border backdrop-blur-md'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <a href="/" id="nav-logo" className="flex items-center gap-2">
          <span className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="8" width="3" height="6" rx="1" fill="white" />
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="white" />
              <rect x="11" y="2" width="3" height="12" rx="1" fill="white" />
            </svg>
          </span>
          <span className="font-bold text-base text-foreground tracking-tight">
            Trackly
          </span>
        </a>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a
            href="#features"
            id="nav-features"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#download"
            id="nav-download"
            className="bg-accent text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-transform hover:scale-[1.02] inline-block"
          >
            Download App
          </a>
        </div>
      </nav>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section
      ref={ref}
      id="hero"
      className="pt-28 sm:pt-32 pb-20 sm:pb-24 overflow-hidden relative"
    >
      {/* Faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 border border-border rounded-full px-3.5 py-1 text-xs text-muted font-medium bg-card">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Personal activity tracking, reimagined
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight text-foreground max-w-3xl mx-auto mb-5"
        >
          Track what matters.
          <br />
          <span className="text-accent">See the pattern.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-sm sm:text-base md:text-lg text-muted max-w-lg mx-auto mb-10 leading-relaxed"
        >
          Define your own categories — workouts, reading, coding, anything —
          then log daily and watch your habits build into streaks and heatmaps.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center gap-3 mb-16 sm:mb-20"
        >
          <a
            href="#download"
            id="hero-cta-primary"
            className="bg-accent text-white px-6 sm:px-7 py-3 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.02] shadow-sm inline-block"
          >
            Download App
          </a>
          <a
            href="/register"
            id="hero-cta-secondary"
            className="bg-surface text-foreground border border-border px-5 sm:px-6 py-3 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02] inline-block"
          >
            Register
          </a>
        </motion.div>

        {/* Hero screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto relative"
        >
          {/* Browser chrome */}
          <div className="border border-border rounded-xl overflow-hidden shadow-2xl bg-card">
            {/* Fake toolbar */}
            <div className="h-9 bg-surface flex items-center gap-1.5 px-3.5 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="flex-1 mx-4 bg-card rounded h-5 flex items-center px-2.5">
                <span className="text-[11px] text-muted">app.trackly.io/dashboard</span>
              </div>
            </div>
            <motion.img
              style={{ y: imgY }}
              className="block w-full h-auto"
              src="/dashboard.png"
              alt="Trackly dashboard showing activity heatmap and streak counter"
            />
          </div>

          {/* Glow beneath screenshot */}
          <div
            aria-hidden
            className="absolute -bottom-10 left-[10%] right-[10%] h-20 bg-accent blur-[60px] opacity-15 rounded-full -z-10"
          />
        </motion.div>
      </div>
    </section>
  );
}

// ── Stats bar ────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '50+', label: 'trackable activity types' },
    { value: '365', label: 'days of history per category' },
    { value: '∞', label: 'custom categories' },
    { value: '1', label: 'place for all your habits' },
  ];
  return (
    <section className="border-y border-border py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <div className={`text-center py-2 ${i < 3 ? 'md:border-r md:border-border' : ''}`}>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-muted mt-1 px-2">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Features section ─────────────────────────────────────────────
function Features() {
  const features = [
    {
      id: 'feature-heatmap',
      title: 'Contribution heatmaps for everything',
      description:
        'Not just code commits. Track your workouts, reading sessions, pages written, or meditation minutes in a sleek GitHub-style contribution grid.',
      screenshot: '/contribution-heatmap.png',
      screenshotAlt: 'Contribution heatmap view',
      flip: false,
    },
    {
      id: 'feature-log',
      title: 'Log in under 10 seconds',
      description:
        'Quick daily logging with optional notes. No friction, no forms — just mark what you did and move on. The habit of logging is as important as the habit itself.',
      screenshot: '/log-activity.png',
      screenshotAlt: 'Log activity screen',
      flip: true,
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <p className="text-center text-xs font-semibold tracking-widest text-accent uppercase mb-3 sm:mb-4">
            How it works
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground max-w-xl mx-auto mb-10 sm:mb-16">
            Three steps to a clearer picture of your habits
          </h2>
        </Reveal>

        <div className="flex flex-col gap-12 sm:gap-20 md:gap-24">
          {features.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
            >
              {/* Text */}
              <Reveal className={f.flip ? 'order-1 md:order-2' : 'order-1 md:order-1'}>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">
                    {f.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted leading-relaxed max-w-md">
                    {f.description}
                  </p>
                </div>
              </Reveal>

              {/* Screenshot */}
              <Reveal delay={0.12} className={f.flip ? 'order-2 md:order-1' : 'order-2 md:order-2'}>
                <div className="border border-border rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={f.screenshot}
                    alt={f.screenshotAlt}
                    className="block w-full h-auto"
                  />
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Icon feature grid */}
        <div className="mt-16 sm:mt-24">
          <Reveal>
            <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-8 sm:mb-14">
              Everything you need, nothing you don't
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="10" width="3.5" height="7" rx="1" fill="var(--color-accent)" />
                    <rect x="8" y="6" width="3.5" height="11" rx="1" fill="var(--color-accent)" />
                    <rect x="13" y="2" width="3.5" height="15" rx="1" fill="var(--color-accent)" />
                  </svg>
                ),
                title: 'Activity heatmap',
                desc: 'GitHub-style calendar view for every category, showing intensity at a glance.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2l1.8 5.5H17l-4.5 3.3 1.7 5.2L10 13l-4.2 3 1.7-5.2L3 7.5h5.2L10 2z" fill="var(--color-accent)" />
                  </svg>
                ),
                title: 'Streak counter',
                desc: 'See your current and best streaks per category — the motivator that keeps you going.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7" stroke="var(--color-accent)" strokeWidth="1.8" />
                    <path d="M10 6v4l3 2" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Full history',
                desc: 'Browse every past entry with timestamps and notes. Your log, your data.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="6" height="6" rx="1.5" fill="var(--color-accent)" />
                    <rect x="11" y="3" width="6" height="6" rx="1.5" fill="var(--color-accent)" opacity="0.5" />
                    <rect x="3" y="11" width="6" height="6" rx="1.5" fill="var(--color-accent)" opacity="0.5" />
                    <rect x="11" y="11" width="6" height="6" rx="1.5" fill="var(--color-accent)" />
                  </svg>
                ),
                title: 'Custom categories',
                desc: 'Create and color-code any habit type. No limits, no presets forced on you.',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="p-5 sm:p-6 bg-card border border-border rounded-xl h-full flex flex-col justify-start">
                  <div className="mb-3 sm:mb-4">{item.icon}</div>
                  <div className="text-sm font-semibold text-foreground mb-1.5 sm:mb-2">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section id="download" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-border text-center">
      <div className="max-w-xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center justify-center w-13 h-13 bg-accent/10 border border-accent/20 rounded-xl mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Start tracking today.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-sm sm:text-base text-muted mb-8 leading-relaxed">
            No subscriptions. No clutter. Just a focused tool that helps you
            show up for the things that matter.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <a
            href="#"
            id="final-cta-download"
            className="inline-block bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.02] shadow-sm"
          >
            Download App
          </a>
        </Reveal>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-accent rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="8" width="3" height="6" rx="1" fill="white" />
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="white" />
              <rect x="11" y="2" width="3" height="12" rx="1" fill="white" />
            </svg>
          </span>
          <span className="font-bold text-sm text-foreground">Trackly</span>
        </div>
        <div className="flex items-center gap-5">
          {[
            { label: 'Sign in', href: '/login' },
            { label: 'Register', href: '/register' },
            { label: 'Download', href: '#download' }
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs font-medium text-muted hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Trackly. Built to build habits.
        </p>
      </div>
    </footer>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <FinalCTA />
      <Footer />
    </div>
  );
}
