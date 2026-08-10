import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Mail, FileText, Shield, Trash2, ArrowLeft } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I add a new activity entry?',
    answer: 'Click the "Log Entry" button in the sidebar or bottom navigation, select a category, enter the value for that category (e.g. minutes, pages, km), and save.',
  },
  {
    question: 'How do I create a new category?',
    answer: 'Go to the "Categories" page from the sidebar, click the add button, then fill in the name, unit, color, and icon for your new category.',
  },
  {
    question: 'What is a streak and how does it work?',
    answer: 'A streak calculates how many consecutive days you have recorded at least one activity. Streaks will reset if a day is missed without any entries.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, your data is stored in a secure database and can only be accessed by your account. Check our Privacy Policy for full details.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to Account Settings, or your Profile page, scroll down to the "Delete Account" section, enter the confirmation phrase, and confirm deletion.',
  },
  {
    question: 'Can I sign in using Google?',
    answer: 'Yes. On the login page, click "Sign in with Google" and follow the authentication flow.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={() => setOpen((prev) => !prev)} className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer">
        <span className="text-sm font-medium text-foreground">{question}</span>
        <ChevronDown size={16} className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-muted">{answer}</p>}
    </div>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState('');

  const filteredFaqs = FAQS.filter((faq) => faq.question.toLowerCase().includes(query.toLowerCase()) || faq.answer.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      {/* Header top bar */}
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

      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Help & Support</h1>
          <p className="mt-1 text-sm text-muted">Search for answers or contact us directly.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
          />
        </div>

        {/* FAQ list */}
        <div className="mb-10 rounded-xl border border-border bg-card px-5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />)
          ) : (
            <p className="py-8 text-center text-sm text-muted">No results found for "{query}"</p>
          )}
        </div>

        {/* Contact section */}
        <div className="mb-10 rounded-xl border border-border bg-card p-6 text-center">
          <h3 className="text-sm font-semibold text-foreground mb-1">Still need help?</h3>
          <p className="text-xs text-muted mb-4">Send an email and we will get back to you as soon as possible.</p>
          <a
            href="mailto:ichwanpwt22@gmail.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors cursor-pointer"
          >
            <Mail size={14} />
            Contact Support
          </a>
        </div>

        {/* Quick links to legal pages */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Link to="/terms-of-service" className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted transition hover:text-foreground hover:bg-surface">
            <FileText size={14} />
            Terms of Service
          </Link>
          <Link to="/privacy-policy" className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted transition hover:text-foreground hover:bg-surface">
            <Shield size={14} />
            Privacy Policy
          </Link>
          <Link to="/data-deletion" className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted transition hover:text-foreground hover:bg-surface">
            <Trash2 size={14} />
            Data Deletion
          </Link>
        </div>
      </div>
    </div>
  );
}
