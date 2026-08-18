/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */
/* Hallmark · macrostructure: Conversational FAQ · tone: calm-focused · anchor hue: orange */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Mail, FileText, Shield, Trash2, ArrowLeft, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I add a new activity entry?',
    answer: 'Click the "Log Entry" button in the sidebar or bottom navigation, select a category, enter the numeric value for that habit (e.g. minutes, pages, cups), and save.',
  },
  {
    question: 'How do I create a new custom category?',
    answer: 'Navigate to the "Categories" page from the sidebar, click "Add Category", then configure the name, unit type, color accent, and icon for your routine.',
  },
  {
    question: 'What is a streak and how is it calculated?',
    answer: 'A streak counts consecutive days where you recorded at least one activity. If a full calendar day passes without any entry, the current streak resets to 0.',
  },
  {
    question: 'Is my personal activity data secure?',
    answer: 'Yes. Your records are protected behind JWT authentication and stored in secure PostgreSQL database instances. Read our Privacy Policy for details.',
  },
  {
    question: 'How do I delete my account and data?',
    answer: 'Go to Profile settings, scroll to the Account Deletion section, and confirm deletion. You can also review our Data Deletion guide.',
  },
  {
    question: 'Can I install Trackly on my smartphone?',
    answer: 'Yes! Trackly is a Progressive Web App (PWA). Click "Download App" or select "Add to Home Screen" in your mobile browser.',
  },
];

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left cursor-pointer group"
      >
        <span className="text-base font-bold text-foreground group-hover:text-accent transition flex items-center gap-3">
          <span className="font-mono text-xs text-accent">0{index + 1}</span>
          <span>{question}</span>
        </span>
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180 text-foreground' : ''}`} />
      </button>
      {open && <p className="mt-3 pl-8 text-sm leading-relaxed text-muted">{answer}</p>}
    </div>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState('');

  const filteredFaqs = FAQS.filter(
    (faq) => faq.question.toLowerCase().includes(query.toLowerCase()) || faq.answer.toLowerCase().includes(query.toLowerCase())
  );

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
        <div className="mb-8 pb-6 border-b border-border">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono font-medium text-muted">
            <HelpCircle className="h-3.5 w-3.5 text-accent" />
            <span>HELP & DOCUMENTATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Help Center</h1>
          <p className="mt-2 text-sm text-muted">Search common questions or contact support directly.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} index={idx} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted">No questions found matching "{query}"</p>
          )}
        </div>

        {/* Contact Support Banner */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6 text-center">
          <h3 className="text-base font-bold text-foreground mb-1">Still need assistance?</h3>
          <p className="text-xs text-muted mb-4">Send an email to our support team and we will respond promptly.</p>
          <a
            href="mailto:ichwanpwt22@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-medium hover:opacity-90 transition focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Mail size={14} />
            <span>Contact Support</span>
          </a>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/terms-of-service"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition"
          >
            <FileText size={15} className="text-accent" />
            <span>Terms of Service</span>
          </Link>
          <Link
            to="/privacy-policy"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition"
          >
            <Shield size={15} className="text-accent" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/data-deletion"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3.5 text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition"
          >
            <Trash2 size={15} className="text-accent" />
            <span>Data Deletion</span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border bg-card/30 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <span>© 2026 Trackly. Knowledge & Support.</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
