import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../store/dataStore';
import { getIcon } from '../utils/icons';
import { getUnit } from '../utils/format';

export function LogEntryPage() {
  const { categories, addEntry } = useData();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const cleanUnit = getUnit(selectedCategory?.unit);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!categoryId) errs.category = 'Select a category.';
    if (!value || isNaN(Number(value)) || Number(value) <= 0) errs.value = 'Enter a valid number.';
    if (!date) errs.date = 'Required.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await addEntry({ categoryId, date, value: Number(value), note: note.trim() || undefined });
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────
  if (submitted && selectedCategory) {
    const Icon = getIcon(selectedCategory.icon);
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 pb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${selectedCategory.color}18` }}>
          <Icon size={28} style={{ color: selectedCategory.color }} />
        </div>

        <p className="text-3xl font-bold text-foreground tabular-nums">
          {value} {cleanUnit && <span className="text-lg font-normal text-muted">{cleanUnit}</span>}
        </p>
        <p className="text-sm text-muted mt-1">{selectedCategory.name}</p>

        <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full" style={{ background: `${selectedCategory.color}12` }}>
          <Check size={12} style={{ color: selectedCategory.color }} />
          <span className="text-xs font-medium" style={{ color: selectedCategory.color }}>
            Logged
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs mt-8">
          <button
            onClick={() => {
              setSubmitted(false);
              setValue('');
              setNote('');
              setDate(today);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white cursor-pointer active:scale-[0.97] transition-transform"
          >
            Log another
          </button>
          <button onClick={() => navigate('/dashboard')} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface border border-border text-foreground cursor-pointer active:scale-[0.97] transition-transform">
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer">
          <ArrowLeft size={17} />
        </button>
        <h1 className="text-base font-semibold text-foreground">Log activity</h1>
      </div>

      <form id="form-log-entry" onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <p className="text-xs text-muted mb-2">Category</p>

          {categories.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted">No categories yet.</p>
              <button type="button" onClick={() => navigate('/categories')} className="mt-1 text-xs text-accent cursor-pointer">
                Create one →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = getIcon(cat.icon);
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`cat-btn-${cat.id}`}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setErrors((p) => ({ ...p, category: '' }));
                    }}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left cursor-pointer active:scale-[0.97] transition-all"
                    style={isSelected ? { borderColor: cat.color, background: `${cat.color}12` } : { borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cat.color}20` }}>
                      <Icon size={14} style={{ color: cat.color }} />
                    </div>
                    <span className={`text-xs font-medium truncate ${isSelected ? 'text-foreground' : 'text-muted'}`}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
        </div>

        {/* Value + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted mb-1.5 truncate">{cleanUnit ? `Amount (${cleanUnit})` : 'Value'}</p>
            <input
              id="input-value"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setErrors((p) => ({ ...p, value: '' }));
              }}
              className={`w-full px-3.5 py-2.5 bg-surface border rounded-xl text-foreground text-base font-semibold placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors ${
                errors.value ? 'border-red-400' : 'border-border'
              }`}
            />
            {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
          </div>

          <div>
            <p className="text-xs text-muted mb-1.5">Date</p>
            <input
              id="input-date"
              type="date"
              value={date}
              max={today}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((p) => ({ ...p, date: '' }));
              }}
              className={`w-full px-3.5 py-2.5 bg-surface border rounded-xl text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors ${
                errors.date ? 'border-red-400' : 'border-border'
              }`}
            />
            {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
          </div>
        </div>

        {/* Note */}
        <div>
          <p className="text-xs text-muted mb-1.5">
            Note <span className="text-muted/60">(optional)</span>
          </p>
          <textarea
            id="input-note"
            rows={3}
            placeholder="Any notes…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-foreground text-sm placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          id="btn-submit-entry"
          type="submit"
          disabled={saving || categories.length === 0}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98] cursor-pointer"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}
