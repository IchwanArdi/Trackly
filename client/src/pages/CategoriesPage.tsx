import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData, type Category } from '../store/dataStore';
import { getIcon, ICON_OPTIONS } from '../utils/icons';
import { formatUnit } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const PRESET_COLORS = [
  '#e85d04', '#f97316', '#eab308', '#22c55e',
  '#0ea5e9', '#6366f1', '#a855f7', '#ec4899',
  '#14b8a6', '#64748b',
];

interface CategoryFormState { name: string; unit: string; color: string; icon: string; }

const defaultForm = (): CategoryFormState => ({ name: '', unit: '', color: PRESET_COLORS[0], icon: 'Activity' });

function CategoryForm({
  form, setForm, errors, handleSave, handleCancel,
}: {
  form: CategoryFormState;
  setForm: Dispatch<SetStateAction<CategoryFormState>>;
  errors: Record<string, string>;
  handleSave: () => void;
  handleCancel: () => void;
}) {
  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-border">
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="input-cat-name"
          label="Name"
          placeholder="e.g. Running, Workout"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />
        <Input
          id="input-cat-unit"
          label="Unit"
          placeholder="km, mins, sessions…"
          value={form.unit}
          onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
          error={errors.unit}
        />
      </div>

      {/* Color */}
      <div>
        <p className="text-xs text-muted mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setForm(f => ({ ...f, color }))}
              className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer"
              style={{
                background: color,
                borderColor: form.color === color ? '#fff' : 'transparent',
                boxShadow: form.color === color ? `0 0 0 1.5px ${color}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Icon */}
      <div className="w-36">
        <Select
          id="select-cat-icon"
          label="Icon"
          value={form.icon}
          onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
        >
          {ICON_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
        </Select>
      </div>

      <div className="flex gap-2">
        <Button id="btn-save-category" variant="primary" size="sm" icon={<Check size={13} />} onClick={handleSave}>Save</Button>
        <Button id="btn-cancel-category" variant="ghost" size="sm" icon={<X size={13} />} onClick={handleCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { categories, entries, addCategory, updateCategory, deleteCategory } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(defaultForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const catStats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const map: Record<string, { total: number; month: number }> = {};
    for (const e of entries) {
      if (!map[e.categoryId]) map[e.categoryId] = { total: 0, month: 0 };
      map[e.categoryId].total++;
      if (isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }))
        map[e.categoryId].month++;
    }
    return map;
  }, [entries]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.unit.trim()) errs.unit = 'Required';
    return errs;
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, unit: formatUnit(cat.unit), color: cat.color, icon: cat.icon });
    setShowForm(false);
    setErrors({});
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    // Normalize unit string e.g. "1km" -> "km"
    const cleanedForm = {
      ...form,
      unit: formatUnit(form.unit),
    };

    try {
      if (editingId) { await updateCategory(editingId, cleanedForm); setEditingId(null); }
      else { await addCategory(cleanedForm); setShowForm(false); }
      setForm(defaultForm());
      setErrors({});
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try { await deleteCategory(id); } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete');
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setForm(defaultForm());
    setErrors({});
  };

  return (
    <div className="space-y-4 pb-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Categories</h1>
          <p className="text-xs text-muted mt-0.5">What you track</p>
        </div>
        {!showForm && !editingId && (
          <Button
            id="btn-new-category"
            variant="primary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => { setShowForm(true); setForm(defaultForm()); }}
          >
            New
          </Button>
        )}
      </div>

      {/* New form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-medium text-foreground">New category</p>
          <CategoryForm form={form} setForm={setForm} errors={errors} handleSave={handleSave} handleCancel={handleCancel} />
        </div>
      )}

      {/* List */}
      {categories.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted">No categories yet.</p>
          <button
            onClick={() => { setShowForm(true); setForm(defaultForm()); }}
            className="mt-2 text-xs font-semibold text-accent cursor-pointer"
          >
            Create one
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => {
            const Icon = getIcon(cat.icon);
            const isEditing = editingId === cat.id;
            const isDeleting = deleteConfirm === cat.id;
            const stats = catStats[cat.id] ?? { total: 0, month: 0 };
            const cleanUnit = formatUnit(cat.unit);

            return (
              <div
                key={cat.id}
                className={`bg-card border rounded-xl overflow-hidden transition-colors ${
                  isEditing ? 'border-accent/40' : isDeleting ? 'border-red-500/30' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Color dot + icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${cat.color}18` }}
                  >
                    <Icon size={18} style={{ color: cat.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {cleanUnit}
                      {stats.total > 0 && (
                        <span className="ml-2 text-muted/60">
                          · {stats.month > 0 ? `${stats.month} this month` : `${stats.total} logged`}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        id={`btn-edit-cat-${cat.id}`}
                        onClick={() => startEdit(cat)}
                        className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        id={`btn-delete-cat-${cat.id}`}
                        onClick={() => handleDelete(cat.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isDeleting ? 'bg-red-500 text-white' : 'text-muted hover:text-red-400 hover:bg-surface'
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="px-4 pb-4">
                    <CategoryForm form={form} setForm={setForm} errors={errors} handleSave={handleSave} handleCancel={handleCancel} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
