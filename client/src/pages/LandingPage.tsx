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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(15,15,16,0.92)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <nav
        style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}
        className="flex items-center justify-between h-14"
      >
        {/* Logo */}
        <a href="/" id="nav-logo" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <span
            style={{
              width: 28, height: 28, background: 'var(--color-accent)',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="8" width="3" height="6" rx="1" fill="white" />
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="white" />
              <rect x="11" y="2" width="3" height="12" rx="1" fill="white" />
            </svg>
          </span>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-foreground)', letterSpacing: '-0.3px' }}>
            Trackly
          </span>
        </a>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a
            href="#features"
            id="nav-features"
            style={{ color: 'var(--color-muted)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#download"
            id="nav-download"
            style={{
              background: 'var(--color-accent)', color: '#fff',
              padding: '7px 16px', borderRadius: 7, fontSize: 13,
              fontWeight: 600, textDecoration: 'none', display: 'inline-block',
            }}
            className="transition-transform hover:scale-[1.02]"
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
      style={{ paddingTop: 120, paddingBottom: 96, overflow: 'hidden', position: 'relative' }}
    >
      {/* Faint grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
          opacity: 0.35,
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--color-border)', borderRadius: 99,
              padding: '5px 14px', fontSize: 12, color: 'var(--color-muted)',
              fontWeight: 500, background: 'var(--color-card)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
            Personal activity tracking, reimagined
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: 'center', fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px',
            color: 'var(--color-foreground)', margin: '0 auto 20px',
            maxWidth: 820,
          }}
        >
          Track what matters.
          <br />
          <span style={{ color: 'var(--color-accent)' }}>See the pattern.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{
            textAlign: 'center', fontSize: 17, color: 'var(--color-muted)',
            maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65,
          }}
        >
          Define your own categories — workouts, reading, coding, anything —
          then log daily and watch your habits build into streaks and heatmaps.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 72 }}
        >
          <a
            href="#download"
            id="hero-cta-primary"
            style={{
              background: 'var(--color-accent)', color: '#fff',
              padding: '12px 28px', borderRadius: 8, fontSize: 15,
              fontWeight: 600, textDecoration: 'none', display: 'inline-block',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            className="transition-transform hover:scale-[1.02]"
          >
            Download App
          </a>
          <a
            href="/register"
            id="hero-cta-secondary"
            style={{
              background: 'var(--color-surface)', color: 'var(--color-foreground)',
              padding: '12px 24px', borderRadius: 8, fontSize: 15,
              fontWeight: 500, textDecoration: 'none', display: 'inline-block',
              border: '1px solid var(--color-border)',
            }}
            className="transition-transform hover:scale-[1.02]"
          >
            Register
          </a>
        </motion.div>

        {/* Hero screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}
        >
          {/* Browser chrome */}
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
              background: 'var(--color-card)',
            }}
          >
            {/* Fake toolbar */}
            <div
              style={{
                height: 36, background: 'var(--color-surface)',
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 14px', borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <div
                style={{
                  flex: 1, margin: '0 16px',
                  background: 'var(--color-card)', borderRadius: 4,
                  height: 20, display: 'flex', alignItems: 'center',
                  paddingLeft: 10,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>app.trackly.io/dashboard</span>
              </div>
            </div>
            <motion.img
              style={{ y: imgY, display: 'block', width: '100%' }}
              src="/dashboard.png"
              alt="Trackly dashboard showing activity heatmap and streak counter"
            />
          </div>

          {/* Glow beneath screenshot */}
          <div
            aria-hidden
            style={{
              position: 'absolute', bottom: -40, left: '10%', right: '10%', height: 80,
              background: 'var(--color-accent)',
              filter: 'blur(60px)', opacity: 0.12, borderRadius: '50%', zIndex: -1,
            }}
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
    <section
      style={{
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '32px 24px',
      }}
    >
      <div
        style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}
      >
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.07}>
            <div
              style={{
                textAlign: 'center', padding: '8px 0',
                borderRight: i < 3 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-1px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      id: 'feature-categories',
      title: 'Build your own tracking system',
      description:
        'No preset templates. Create categories for exactly the habits that matter to you — whether that\'s climbing sessions, pages read, or hours of deep work.',
      screenshot: '/categories.png',
      screenshotAlt: 'Category management screen',
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
    <section id="features" style={{ padding: '96px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 2, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: 16 }}>
            How it works
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800, letterSpacing: '-1.5px', margin: '0 auto 64px',
              color: 'var(--color-foreground)', maxWidth: 600,
            }}
          >
            Three steps to a clearer picture of your habits
          </h2>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 96 }}>
          {features.map((f) => (
            <div
              key={f.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 64,
                alignItems: 'center',
                direction: f.flip ? 'rtl' : 'ltr',
              }}
            >
              {/* Text */}
              <Reveal>
                <div style={{ direction: 'ltr' }}>
                  <h3
                    style={{
                      fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px',
                      color: 'var(--color-foreground)', marginBottom: 16,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.7, maxWidth: 420 }}>
                    {f.description}
                  </p>
                </div>
              </Reveal>

              {/* Screenshot */}
              <Reveal delay={0.12}>
                <div
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    direction: 'ltr',
                  }}
                >
                  <img
                    src={f.screenshot}
                    alt={f.screenshotAlt}
                    style={{ display: 'block', width: '100%' }}
                  />
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Icon feature grid */}
        <div style={{ marginTop: 96 }}>
          <Reveal>
            <h2
              style={{
                textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 38px)',
                fontWeight: 800, letterSpacing: '-1px', marginBottom: 56,
                color: 'var(--color-foreground)',
              }}
            >
              Everything you need, nothing you don't
            </h2>
          </Reveal>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 2,
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
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
                <div
                  style={{
                    padding: '28px 24px',
                    background: 'var(--color-card)',
                    borderRight: i % 2 === 0 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ marginBottom: 16 }}>{item.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-foreground)', marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.65 }}>
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
    <section
      id="download"
      style={{
        padding: '96px 24px',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Reveal>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52,
              background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
              borderRadius: 12, marginBottom: 28,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
              letterSpacing: '-1.5px', color: 'var(--color-foreground)',
              marginBottom: 16,
            }}
          >
            Start tracking today.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 16, color: 'var(--color-muted)', marginBottom: 36, lineHeight: 1.65 }}>
            No subscriptions. No clutter. Just a focused tool that helps you
            show up for the things that matter.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <a
            href="#"
            id="final-cta-download"
            style={{
              display: 'inline-block',
              background: 'var(--color-accent)', color: '#fff',
              padding: '13px 36px', borderRadius: 8, fontSize: 15,
              fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
            className="transition-transform hover:scale-[1.02]"
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
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 22, height: 22, background: 'var(--color-accent)',
              borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="8" width="3" height="6" rx="1" fill="white" />
              <rect x="6.5" y="5" width="3" height="9" rx="1" fill="white" />
              <rect x="11" y="2" width="3" height="12" rx="1" fill="white" />
            </svg>
          </span>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-foreground)' }}>Trackly</span>
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
              style={{ fontSize: 13, color: 'var(--color-muted)', textDecoration: 'none', fontWeight: 500 }}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          © {new Date().getFullYear()} Trackly. Built to build habits.
        </p>
      </div>
    </footer>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <FinalCTA />
      <Footer />
    </div>
  );
}
