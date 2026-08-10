import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function DataDeletion() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple top bar */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <Link to="/" id="nav-logo" className="flex items-center gap-2.5">
            <img src="/trackly-icon.webp" alt="Trackly Icon" className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Trackly</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={13} />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-8 py-14 md:py-20">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Data Deletion Instructions</h1>
          <p className="text-sm text-muted">Last updated: August 3, 2026</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90 mb-10 pb-10 border-b border-border">
          If you would like to delete your Trackly account and all associated data (profile, categories, and activity logs), you can do so using either of the methods below.
        </p>

        <div className="space-y-10">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Option 1: Delete via the App</h2>
            <ol className="list-decimal list-inside space-y-1.5 text-sm leading-relaxed text-muted">
              <li>Sign in to your Trackly account</li>
              <li>Go to Settings / Profile</li>
              <li>Select "Delete Account"</li>
              <li>Confirm the deletion when prompted</li>
            </ol>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Option 2: Request via Email</h2>
            <p className="text-sm leading-relaxed text-muted">
              Send an email to{' '}
              <a href="mailto:ichwanpwt22@gmail.com" className="text-accent hover:underline">
                ichwanpwt22@gmail.com
              </a>{' '}
              with the subject "Data Deletion Request", including the email address associated with your Trackly account. Your data will be deleted within 7 business days.
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-foreground mb-2">What Gets Deleted</h2>
            <p className="text-sm leading-relaxed text-muted">Once processed, all of your account data including your name, email, categories, and activity history will be permanently removed from our servers and cannot be recovered.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between text-xs text-muted">
          <span>© 2026 Trackly. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
