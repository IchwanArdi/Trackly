import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, Mail, FileText, Shield, Trash2, Activity, ArrowLeft } from 'lucide-react';

const FAQS = [
  {
    question: 'Bagaimana cara menambahkan entri aktivitas baru?',
    answer: 'Klik tombol "Log Entry" di sidebar, pilih kategori, isi nilai sesuai satuan kategori tersebut (misal menit, halaman, km), lalu simpan.',
  },
  {
    question: 'Bagaimana cara membuat kategori baru?',
    answer: 'Buka halaman "Categories" di sidebar, klik tombol tambah, lalu isi nama, satuan, warna, dan ikon untuk kategori tersebut.',
  },
  {
    question: 'Apa itu streak dan bagaimana cara kerjanya?',
    answer: 'Streak menghitung berapa hari berturut-turut kamu mencatat aktivitas tanpa putus. Streak akan reset jika ada hari yang terlewat tanpa entri.',
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Ya, data disimpan di database yang aman dan hanya bisa diakses oleh akun kamu sendiri. Lihat Privacy Policy untuk detail lengkap.',
  },
  {
    question: 'Bagaimana cara menghapus akun saya?',
    answer: 'Buka Account Settings, atau kirim email permintaan penghapusan akun. Lihat halaman Data Deletion untuk instruksi lengkap.',
  },
  {
    question: 'Bisakah saya login pakai Google?',
    answer: 'Bisa. Di halaman login, klik "Sign in dengan Google" dan ikuti proses autentikasinya.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={() => setOpen((prev) => !prev)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
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
      {/* Simple top bar */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 md:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Trackly</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
            <ArrowLeft size={13} />
            Kembali
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Bantuan</h1>
          <p className="mt-1 text-sm text-muted">Cari jawaban atau hubungi kami langsung.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pertanyaan..."
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* FAQ */}
        <div className="mb-10 rounded-lg border border-border bg-card px-4">
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />) : <p className="py-6 text-center text-sm text-muted">Tidak ada hasil untuk "{query}"</p>}
        </div>

        {/* Contact */}
        <div className="mb-10 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Masih butuh bantuan?</h2>
          <p className="mt-1 text-sm text-muted">Kirim email dan kami akan merespons secepatnya.</p>
          <a href="mailto:ichwanpwt22@gmail.com" className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface">
            <Mail size={14} />
            ichwanpwt22@gmail.com
          </a>
        </div>

        {/* Quick links to legal pages */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Link to="/terms-of-service" className="flex items-center gap-2.5 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted transition hover:text-foreground hover:bg-surface">
            <FileText size={14} />
            Terms of Service
          </Link>
          <Link to="/privacy-policy" className="flex items-center gap-2.5 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted transition hover:text-foreground hover:bg-surface">
            <Shield size={14} />
            Privacy Policy
          </Link>
          <Link to="/data-deletion" className="flex items-center gap-2.5 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted transition hover:text-foreground hover:bg-surface">
            <Trash2 size={14} />
            Data Deletion
          </Link>
        </div>
      </div>
    </div>
  );
}
