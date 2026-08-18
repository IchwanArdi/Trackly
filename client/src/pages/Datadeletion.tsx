/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Long Document · tone: calm-focused · anchor hue: orange */
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ShieldAlert } from 'lucide-react';

export function DataDeletion() {
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
            <Trash2 className="h-3.5 w-3.5 text-accent" />
            <span>USER DATA CONTROL · DEL-2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Data Deletion Instructions</h1>
          <p className="mt-2 text-sm text-muted">Last updated: August 2026 · Account Removal Protocol</p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-foreground/90 mb-10 pb-8 border-b border-border">
          Trackly provides straightforward mechanisms to permanently delete your profile, habit categories, and activity logs from our servers.
        </p>

        <div className="space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-accent">OPTION 01</span>
              <h2 className="text-lg font-bold text-foreground">Self-Service Account Deletion</h2>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted leading-relaxed">
              <li>Log in to your Trackly account at <Link to="/login" className="text-accent hover:underline">/login</Link></li>
              <li>Navigate to <strong>Profile / Settings</strong> in the main navigation</li>
              <li>Scroll down to the <strong>Danger Zone</strong> section</li>
              <li>Click <strong>Delete Account</strong> and confirm when prompted</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-accent">OPTION 02</span>
              <h2 className="text-lg font-bold text-foreground">Manual Deletion Request via Email</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Send an email to{' '}
              <a href="mailto:ichwanpwt22@gmail.com" className="text-accent hover:underline font-semibold">
                ichwanpwt22@gmail.com
              </a>{' '}
              with the subject line <code className="px-2 py-0.5 rounded bg-surface border border-border font-mono text-xs text-foreground">Data Deletion Request</code>. Specify the registered email address associated with your account. Requests are processed within 5 business days.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/50 p-6 flex items-start gap-4">
            <ShieldAlert className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Scope of Permanent Removal</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Deletion is irreversible. Once processed, your account record, email address, custom category definitions, and daily activity logs will be permanently erased from PostgreSQL storage and backups.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/30 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <span>© 2026 Trackly. Data Sovereignty & Control.</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition">
              Terms of Service
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
