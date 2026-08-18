import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, Pencil, Trash2, Check, X, BarChart2, Folder } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData, type Category } from '../store/dataStore';
import { getIcon, ICON_OPTIONS } from '../utils/icons';
import { getUnit, UNIT_OPTIONS } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ProgressDetailModal } from '../components/ProgressDetailModal';
import { ShareProgressModal, type ShareCategoryData } from '../components/ShareProgressModal';

const PRESET_COLORS = ['#e85d04', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#64748b'];
const CUSTOM_UNIT_VALUE = '__custom__';

interface CategoryFormState {
  name: string;
  unit: string;
  color: string;
  icon: string;
}

const defaultForm = (): CategoryFormState => ({ name: '', unit: '', color: PRESET_COLORS[0], icon: 'Activity' });

function CategoryForm({
  form,
  setForm,
  errors,
  handleSave,
  handleCancel,
}: {
  form: CategoryFormState;
  setForm: Dispatch<SetStateAction<CategoryFormState>>;
  errors: Record<string, string>;
  handleSave: () => void;
  handleCancel: () => void;
}) {
  // Mode custom aktif kalau unit-nya diisi tapi gak ada di daftar preset (misal lagi edit kategori lama)
  const [customMode, setCustomMode] = useState(() => form.unit !== '' && !UNIT_OPTIONS.includes(form.unit));

  const selectValue = customMode ? CUSTOM_UNIT_VALUE : form.unit;

  const handleUnitSelectChange = (value: string) => {
    if (value === CUSTOM_UNIT_VALUE) {
      setCustomMode(true);
      setForm((f) => ({ ...f, unit: '' }));
    } else {
      setCustomMode(false);
      setForm((f) => ({ ...f, unit: value }));
    }
  };

  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-border">
      <div className="grid grid-cols-2 gap-3">
        <Input id="input-cat-name" label="Name" placeholder="e.g. Running, Workout" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />

        <div>
          <Select id="select-cat-unit" label="Unit" value={selectValue} onChange={(e) => handleUnitSelectChange(e.target.value)} error={!customMode ? errors.unit : undefined}>
            <option value="" disabled>
              Select unit
            </option>
            {UNIT_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value={CUSTOM_UNIT_VALUE}>Custom...</option>
          </Select>

          {customMode && (
            <div className="mt-2">
              <Input id="input-cat-unit-custom" placeholder="e.g. glasses, pages, push-ups" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} error={errors.unit} autoFocus />
            </div>
          )}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="text-xs text-muted mb-2">Color accent</p>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color }))}
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

      {/* Icon selector */}
      <div className="w-36">
        <Select id="select-cat-icon" label="Icon" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
          {ICON_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2">
        <Button id="btn-save-category" variant="primary" size="sm" icon={<Check size={13} />} onClick={handleSave}>
          Save
        </Button>
        <Button id="btn-cancel-category" variant="ghost" size="sm" icon={<X size={13} />} onClick={handleCancel}>
          Cancel
        </Button>
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

  const [selectedCatDetail, setSelectedCatDetail] = useState<Category | null>(null);
  const [shareCategory, setShareCategory] = useState<ShareCategoryData | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const catStats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const map: Record<string, { total: number; month: number }> = {};
    for (const e of entries) {
      if (!map[e.categoryId]) map[e.categoryId] = { total: 0, month: 0 };
      map[e.categoryId].total++;
      if (isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })) map[e.categoryId].month++;
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
    setForm({ name: cat.name, unit: getUnit(cat.unit), color: cat.color, icon: cat.icon });
    setShowForm(false);
    setErrors({});
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const cleanedForm = {
      ...form,
      unit: getUnit(form.unit),
    };

    try {
      if (editingId) {
        await updateCategory(editingId, cleanedForm);
        setEditingId(null);
      } else {
        await addCategory(cleanedForm);
        setShowForm(false);
      }
      setForm(defaultForm());
      setErrors({});
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteCategory(id);
      } catch (err: unknown) {
        toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to delete');
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
      {/* Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden h-36 border border-border bg-card p-4 flex flex-col justify-between select-none shadow-lg">
        <img src="/images/banner2.webp" alt="Categories Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-transparent" />

        <div className="relative flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
            <Folder size={11} className="text-emerald-400" />
            Categories Deck
          </span>

          {!showForm && !editingId && (
            <Button
              id="btn-new-category"
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => {
                setShowForm(true);
                setForm(defaultForm());
              }}
            >
              New Category
            </Button>
          )}
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-extrabold text-white tabular-nums">{categories.length}</h1>
            <span className="text-xs text-white/80 font-medium">Active Categories</span>
          </div>
          <p className="text-[11px] text-white/70 mt-0.5">Customize habits & activity types</p>
        </div>
      </div>

      {/* New Category Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm animate-fade-up">
          <p className="text-sm font-semibold text-foreground">Create New Category</p>
          <CategoryForm form={form} setForm={setForm} errors={errors} handleSave={handleSave} handleCancel={handleCancel} />
        </div>
      )}

      {/* Categories Grid */}
      {categories.length === 0 && !showForm ? (
        <div className="bg-card border border-border rounded-xl py-12 text-center">
          <p className="text-xs text-muted">No categories created yet.</p>
          <button
            onClick={() => {
              setShowForm(true);
              setForm(defaultForm());
            }}
            className="mt-2 text-xs font-semibold text-accent cursor-pointer"
          >
            Create your first category →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            const isEditing = editingId === cat.id;
            const isDeleting = deleteConfirm === cat.id;
            const stats = catStats[cat.id] ?? { total: 0, month: 0 };
            const cleanUnit = getUnit(cat.unit);

            return (
              <div
                key={cat.id}
                className={`bg-card border rounded-2xl overflow-hidden transition-all shadow-sm ${isEditing ? 'border-accent/60 ring-1 ring-accent/30' : isDeleting ? 'border-red-500/40 bg-red-500/5' : 'border-border'}`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Category icon with color halo */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-white/10" style={{ background: `${cat.color}22` }}>
                    <Icon size={18} style={{ color: cat.color }} />
                  </div>

                  {/* Category Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{cat.name}</p>
                      <span className="text-[10px] font-medium text-muted/80 bg-surface px-2 py-0.5 rounded-full border border-border shrink-0">{cleanUnit}</span>
                    </div>

                    <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                      <span>{stats.month} logged this month</span>
                      {stats.total > 0 && <span className="text-muted/40">· {stats.total} total</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Deep Insights button */}
                      <button onClick={() => setSelectedCatDetail(cat)} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer" title="View Category Insights & Share Card">
                        <BarChart2 size={15} />
                      </button>

                      {/* Edit button */}
                      <button id={`btn-edit-cat-${cat.id}`} onClick={() => startEdit(cat)} className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors cursor-pointer" title="Edit category">
                        <Pencil size={14} />
                      </button>

                      {/* Delete button */}
                      <button
                        id={`btn-delete-cat-${cat.id}`}
                        onClick={() => handleDelete(cat.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${isDeleting ? 'bg-red-500 text-white' : 'text-muted hover:text-red-400 hover:bg-surface'}`}
                        title="Delete category"
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

      {/* Progress Detail Modal */}
      {selectedCatDetail && (
        <ProgressDetailModal
          isOpen={Boolean(selectedCatDetail)}
          onClose={() => setSelectedCatDetail(null)}
          onOpenShare={(cat) => {
            setSelectedCatDetail(null);
            setShareCategory(cat);
            setShareModalOpen(true);
          }}
          category={selectedCatDetail}
          entries={entries}
        />
      )}

      {/* Share Progress Modal */}
      <ShareProgressModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareCategory(null);
        }}
        title="Category Highlights"
        category={shareCategory}
        stats={
          shareCategory
            ? {
              totalValue: entries.filter((e) => e.categoryId === shareCategory.id).reduce((sum, e) => sum + e.value, 0),
              totalLogs: entries.filter((e) => e.categoryId === shareCategory.id).length,
              streakDays: 7,
              periodLabel: `Logged on Trackly`,
            }
            : {
              totalLogs: entries.length,
              streakDays: 7,
              periodLabel: 'Category Highlights Overview',
              categoriesCount: categories.length,
            }
        }
      />
    </div>
  );
}
