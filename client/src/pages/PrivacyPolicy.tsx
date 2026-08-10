import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: (
      <>
        <p className="text-sm leading-relaxed text-muted mb-3">We collect the following information when you use Trackly:</p>
        <ul className="list-disc list-inside space-y-1.5 text-sm leading-relaxed text-muted">
          <li>Your name and email address (provided during registration, or received from Google if you log in via Google)</li>
          <li>Activity data you input yourself, such as categories, entries, values, dates, and notes</li>
        </ul>
      </>
    ),
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information solely to provide the core functionality of Trackly: storing and displaying your activity history, statistics, and progress over time. We do not sell or share your personal data with third parties for advertising purposes.',
  },
  {
    title: '3. Login via Google',
    body: 'If you choose to log in using Google, we only receive your name and email address to create or identify your Trackly account. We do not access any other data from your Google account beyond this.',
  },
  {
    title: '4. Data Storage and Security',
    body: 'Your data is stored securely in our database (PostgreSQL hosted via Supabase) and served through our application hosted on Vercel. We take reasonable technical measures to protect your information from unauthorized access.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your data for as long as your account remains active. You may request deletion of your account and associated data at any time.',
  },
];

export function PrivacyPolicy() {
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
            Kembali
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 md:px-8 py-14 md:py-20">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted">Terakhir diperbarui: 3 Agustus 2026</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90 mb-10 pb-10 border-b border-border">
          Trackly ("we", "us", or "our") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-semibold text-foreground mb-2">{section.title}</h2>
              {typeof section.body === 'string' ? <p className="text-sm leading-relaxed text-muted">{section.body}</p> : section.body}
            </div>
          ))}

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p className="text-sm leading-relaxed text-muted">
              You have the right to access, correct, or delete your personal data. To request deletion of your account and all associated data, please see our{' '}
              <Link to="/data-deletion" className="text-accent hover:underline">
                Data Deletion Instructions
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed text-muted">We may update this Privacy Policy from time to time. Continued use of Trackly after changes are posted constitutes your acceptance of the revised policy.</p>
          </div>

          <div className="pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-foreground mb-2">8. Contact Us</h2>
            <p className="text-sm leading-relaxed text-muted">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:ichwanpwt22@gmail.com" className="text-accent hover:underline">
                ichwanpwt22@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between text-xs text-muted">
          <span>© 2026 Trackly. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/data-deletion" className="hover:text-foreground transition-colors">
              Data Deletion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
