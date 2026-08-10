import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using Trackly in any way, you confirm that you accept these Terms of Service and agree to be bound by them. If you do not agree, please do not use the app.',
  },
  {
    title: '2. Description of Service',
    body: 'Trackly is a personal activity tracking application that allows users to create custom categories and log daily activities to view patterns, streaks, and statistics over time.',
  },
  {
    title: '3. User Accounts',
    body: 'You may create an account using an email and password, or by logging in through a third-party provider such as Google. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
  },
  {
    title: '4. User Content',
    body: "Any data you input into Trackly (categories, activity logs, notes) remains yours. By using the service, you grant us permission to store and process this data solely for the purpose of providing the app's functionality to you.",
  },
  {
    title: '5. Acceptable Use',
    body: "You agree not to misuse Trackly, including but not limited to: attempting unauthorized access to our systems, interfering with the service's normal operation, or using the app for any unlawful purpose.",
  },
  {
    title: '6. Third-Party Login (Google)',
    body: 'If you choose to log in via Google, we receive limited profile information (name and email) from Google to create or identify your Trackly account. We do not access any other Google data beyond this.',
  },
  {
    title: '7. Service Availability',
    body: 'We strive to keep Trackly available at all times, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the service at any time without prior notice.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'Trackly is provided "as is" without warranties of any kind. We are not liable for any loss of data, indirect damages, or issues arising from your use of the service, to the fullest extent permitted by law.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms of Service from time to time. Continued use of Trackly after changes are posted constitutes your acceptance of the revised terms.',
  },
];

export function TermsOfService() {
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
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted">Last updated: August 3, 2026</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90 mb-10 pb-10 border-b border-border">
          Welcome to Trackly! By accessing or using our website and mobile application, you agree to comply with and be bound by the following Terms of Service. Please read them carefully before using the app.
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-semibold text-foreground mb-2">{section.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{section.body}</p>
            </div>
          ))}

          <div className="pt-6 border-t border-border">
            <h2 className="text-base font-semibold text-foreground mb-2">10. Contact Us</h2>
            <p className="text-sm leading-relaxed text-muted">
              If you have any questions about these Terms of Service, please contact us at{' '}
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
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
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
