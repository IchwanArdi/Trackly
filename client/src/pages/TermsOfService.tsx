/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Long Document · tone: calm-focused · anchor hue: orange */
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const SECTIONS = [
  {
    num: '01',
    title: 'Acceptance of Terms',
    body: 'By registering or utilizing Trackly, you acknowledge and agree to be bound by these Terms of Service. If you disagree with any portion, please discontinue access.',
  },
  {
    num: '02',
    title: 'Service Description',
    body: 'Trackly provides personal habit tracking, streak analytics, and visual activity heatmaps to assist users in building routines.',
  },
  {
    num: '03',
    title: 'Account Responsibilities',
    body: 'You are responsible for safeguarding your credentials and for all activities conducted under your account. Promptly notify us of any security compromise.',
  },
  {
    num: '04',
    title: 'Ownership of User Content',
    body: 'All categories, numeric logs, notes, and custom entries remain strictly your property. Trackly processes this data solely to render your personal workspace.',
  },
  {
    num: '05',
    title: 'Acceptable Conduct',
    body: 'You agree not to reverse engineer, disrupt service availability, or attempt unauthorized access to infrastructure hosting Trackly.',
  },
  {
    num: '06',
    title: 'Third-Party Integration (Google OAuth)',
    body: 'Google Sign-In is provided for authentication convenience. We fetch basic account attributes (name and email) strictly to match your user profile.',
  },
  {
    num: '07',
    title: 'Service Modifications',
    body: 'We reserve the right to update, modify, or discontinue features of Trackly to improve performance, security, or maintainability.',
  },
];

export function TermsOfService() {
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
            <FileText className="h-3.5 w-3.5 text-accent" />
            <span>LEGAL TERMS · TOS-2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted">Last updated: August 2026 · User Agreement</p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-foreground/90 mb-10 pb-8 border-b border-border">
          Welcome to Trackly. Please review these Terms of Service governing your access to and use of our web application and services.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.num} className="border-l-2 border-border pl-6 py-1">
              <span className="font-mono text-xs font-bold text-accent">{section.num}</span>
              <h2 className="text-lg font-bold text-foreground mt-1 mb-2">{section.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{section.body}</p>
            </div>
          ))}

          <div className="pt-8 border-t border-border">
            <h2 className="text-lg font-bold text-foreground mb-2">Inquiries & Legal Contact</h2>
            <p className="text-sm leading-relaxed text-muted">
              Questions regarding these Terms should be directed to{' '}
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
          <span>© 2026 Trackly. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition">
              Privacy Policy
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
