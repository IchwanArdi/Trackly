import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData } from '../store/dataStore';
import { getIcon } from '../utils/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

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

  const selectedCategory = categories.find(c => c.id === categoryId);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!categoryId) errs.category = 'Please select a category.';
    if (!value || isNaN(Number(value)) || Number(value) <= 0)
      errs.value = 'Please enter a valid positive number.';
    if (!date) errs.date = 'Please select a date.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await addEntry({
        categoryId,
        date,
        value: Number(value),
        note: note.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setValue('');
        setNote('');
        setDate(today);
      }, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Gagal menyimpan entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">Log an activity</h1>
        <p className="text-xs sm:text-sm text-muted mt-0.5">Record what you did today (or any day).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2">
          <Card className="!p-4 sm:!p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <CheckCircle2 size={40} className="text-accent" />
                <p className="text-base font-semibold text-foreground">Entry logged!</p>
                <p className="text-xs sm:text-sm text-muted">Keep it up — consistency is everything.</p>
                <Button
                  id="btn-log-another"
                  variant="secondary"
                  size="md"
                  className="mt-2"
                  onClick={() => setSubmitted(false)}
                >
                  Log another
                </Button>
              </div>
            ) : (
              <form id="form-log-entry" onSubmit={handleSubmit} className="space-y-5">
                {/* Category selector */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-foreground">Select Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {categories.map(cat => {
                      const Icon = getIcon(cat.icon);
                      const isSelected = categoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          id={`cat-btn-${cat.id}`}
                          onClick={() => { setCategoryId(cat.id); setErrors(prev => ({ ...prev, category: '' })); }}
                          className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-100 min-h-[44px] cursor-pointer ${
                            isSelected
                              ? 'border-accent text-foreground shadow-sm'
                              : 'border-border text-muted hover:text-foreground hover:border-border/80 bg-surface'
                          }`}
                          style={isSelected ? { background: `${cat.color}1a`, borderColor: `${cat.color}` } : {}}
                        >
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ background: `${cat.color}25` }}
                          >
                            <Icon size={14} style={{ color: cat.color }} />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="input-value"
                    label={`Value ${selectedCategory ? `(${selectedCategory.unit})` : ''}`}
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 45"
                    value={value}
                    onChange={e => { setValue(e.target.value); setErrors(prev => ({ ...prev, value: '' })); }}
                    error={errors.value}
                  />
                  <Input
                    id="input-date"
                    label="Date"
                    type="date"
                    value={date}
                    max={today}
                    onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }}
                    error={errors.date}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-note" className="text-xs sm:text-sm font-medium text-foreground">
                    Note <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="input-note"
                    rows={3}
                    placeholder="Any observations, how it went, etc."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface border border-border rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors duration-150 resize-none min-h-[80px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button id="btn-submit-entry" type="submit" variant="primary" size="md" disabled={saving} className="w-full sm:w-auto">
                    {saving ? 'Saving...' : 'Save entry'}
                  </Button>
                  <Button
                    id="btn-cancel-entry"
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar tips */}
        <div className="space-y-4">
          <Card className="!p-4 sm:!p-5">
            <h3 className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wide mb-3">Your categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
              {categories.map(cat => {
                const Icon = getIcon(cat.icon);
                return (
                  <div key={cat.id} className="flex items-center gap-2.5 py-1">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ background: `${cat.color}1a` }}
                    >
                      <Icon size={12} style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{cat.name}</p>
                      <p className="text-[10px] text-muted truncate">{cat.unit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="!p-4 sm:!p-5">
            <h3 className="text-[10px] sm:text-xs font-semibold text-muted uppercase tracking-wide mb-2">Tip</h3>
            <p className="text-xs text-muted leading-relaxed">
              Log entries consistently — even partial days count. Small amounts add up and keep your streak alive.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
