/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Long Document · tone: calm-focused · anchor hue: orange */
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useSeo, useTracklySchema } from '../lib/seo';

const SECTIONS = [
  {
    num: '01',
    title: 'Information We Collect',
    body: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-muted">We collect the minimum necessary information to provide personal habit tracking:</p>
        <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed text-muted pl-1">
          <li>Account identifiers: your name and email address. Email sign-in is verified with a one-time code; Google Sign-In provides your basic profile.</li>
          <li>Activity history: categories, entries, numeric values, completion logs, and personal notes.</li>
          <li>Technical data: aggregate analytics about how the website is used, described in section 04.</li>
        </ul>
      </div>
    ),
  },
  {
    num: '02',
    title: 'How We Use Your Information',
    body: 'We use your data solely to calculate statistics, streaks, and heatmap charts for your personal workspace, to authenticate you, and to keep the service reliable. We never sell, rent, or trade personal data to third parties or advertising networks.',
  },
  {
    num: '03',
    title: 'Passwordless Sign-In & Google OAuth',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          Trackly does not use passwords for authentication. You can sign in with a six-digit code sent to your email or with Google OAuth.
          Email codes expire after 10 minutes, can be used once, and are stored only as a keyed hash.
        </p>
        <p>
          When you use Google Sign-In, we receive your basic profile (name and email) to authorize your account. We request
          no additional Google scopes. A Google account is linked to an existing Trackly account only when Google confirms
          that the email address is verified.
        </p>
      </div>
    ),
  },
  {
    num: '04',
    title: 'Analytics & Cookies',
    body: (
      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          We use Google Analytics 4 to understand aggregate usage and improve the product. It may set first-party cookies
          such as <code className="font-mono text-xs">_ga</code> and collect the page path, device/browser information,
          approximate region, and interaction events such as calls-to-action.
        </p>
        <p>
          Query strings are removed before analytics events are sent, so sign-in codes and email addresses do not appear
          in Google Analytics. We do not send habit entries, notes, or account identifiers to Google Analytics.
        </p>
        <p>
          You can limit analytics with browser privacy settings or the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline font-semibold"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    num: '05',
    title: 'Data Storage & Security',
    body: 'Data is stored in PostgreSQL database instances hosted via Supabase, served securely through Vercel over TLS. Passwords are not used for authentication; password hashes from before the passwordless migration are retained only for rollback and are never used to sign in. One-time login codes are stored only as HMAC hashes with a short expiry, and session tokens expire after seven days.',
  },
  {
    num: '06',
    title: 'Data Retention & Control',
    body: 'Your records remain active for as long as your account exists. You maintain full rights to export your data or delete your account permanently at any time.',
  },
];

export function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy | Trackly',
    description:
      'How Trackly handles account data, passwordless sign-in, analytics cookies, and deletion. Learn about your privacy rights and data retention.',
    path: '/privacy-policy',
  });
  useTracklySchema({ pageName: 'Trackly Privacy Policy', pagePath: '/privacy-policy' });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/20 selection:text-accent">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" id="nav-logo" className="flex items-center gap-2.5">
            <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-7 w-7 rounded-lg" />
            <span className="text-sm font-bold tracking-tight text-foreground">Trackly</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition">
            <ArrowLeft size={13} />
            <span>Back to website</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-8 border-b border-border">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono font-medium text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span>LEGAL SPECIFICATION · PRIV-2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">Last updated: November 2026 · Trackly Data Governance</p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-foreground/90 mb-10 pb-8 border-b border-border">
          Trackly is committed to providing a calm, private activity-tracking environment. This Privacy Policy outlines what information we store, how it is secured, and your rights over your personal history.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.num} className="border-l-2 border-border pl-6 py-1">
              <span className="font-mono text-xs font-bold text-accent">{section.num}</span>
              <h2 className="text-lg font-bold text-foreground mt-1 mb-2">{section.title}</h2>
              {typeof section.body === 'string' ? (
                <p className="text-sm leading-relaxed text-muted">{section.body}</p>
              ) : (
                section.body
              )}
            </div>
          ))}

          <div className="border-l-2 border-border pl-6 py-1">
            <span className="font-mono text-xs font-bold text-accent">07</span>
            <h2 className="text-lg font-bold text-foreground mt-1 mb-2">Your Rights & Data Deletion</h2>
            <p className="text-sm leading-relaxed text-muted">
              You have full rights to request complete deletion of your account and logs. Visit our{' '}
              <Link to="/data-deletion" className="text-accent hover:underline font-semibold">
                Data Deletion Instructions
              </Link>{' '}
              for step-by-step guidance.
            </p>
          </div>

          <div className="pt-8 border-t border-border">
            <h2 className="text-lg font-bold text-foreground mb-2">Contact & Inquiries</h2>
            <p className="text-sm leading-relaxed text-muted">
              For any questions regarding privacy or data handling, reach out directly to{' '}
              <a href="mailto:ichwanpwt22@gmail.com" className="text-accent hover:underline font-semibold">
                ichwanpwt22@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/30 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <span>© 2026 Trackly. Personal Activity Tracking.</span>
          <div className="flex gap-4">
            <Link to="/terms-of-service" className="hover:text-foreground transition">
              Terms of Service
            </Link>
            <Link to="/data-deletion" className="hover:text-foreground transition">
              Data Deletion
            </Link>
            <Link to="/help" className="hover:text-foreground transition">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
