import { useState, type Dispatch, type SetStateAction } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useData, type Category } from '../store/dataStore';
import { getIcon, ICON_OPTIONS } from '../utils/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const PRESET_COLORS = ['#e85d04', '#2d6a4f', '#1d3461', '#7209b7', '#bc6c25', '#0077b6', '#c9184a', '#588157', '#6d6875', '#495867'];

interface CategoryFormState {
  name: string;
  unit: string;
  color: string;
  icon: string;
}

interface CategoryFormProps {
  form: CategoryFormState;
  setForm: Dispatch<SetStateAction<CategoryFormState>>;
  errors: Record<string, string>;
  isInline?: boolean;
  handleSave: () => void;
  handleCancel: () => void;
}

const defaultForm = (): CategoryFormState => ({
  name: '',
  unit: '',
  color: PRESET_COLORS[0],
  icon: 'Activity',
});

function CategoryForm({ form, setForm, errors, isInline = false, handleSave, handleCancel }: CategoryFormProps) {
  return (
    <div className={`space-y-4 ${isInline ? 'bg-surface border border-border rounded-md p-4 mt-3' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id={`input-cat-name${isInline ? '-edit' : ''}`} label="Category name" placeholder="e.g. Yoga" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
        <Input id={`input-cat-unit${isInline ? '-edit' : ''}`} label="Unit" placeholder="e.g. minutes, pages, km" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} error={errors.unit} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs sm:text-sm font-medium text-foreground">Color</span>
        <div className="flex gap-2.5 flex-wrap items-center">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              id={`color-btn-${color.replace('#', '')}`}
              onClick={() => setForm((f) => ({ ...f, color }))}
              className={`w-7 h-7 sm:w-6 sm:h-6 rounded-md border-2 transition-transform hover:scale-110 cursor-pointer min-w-7 min-h-7 ${form.color === color ? 'border-foreground scale-110 ring-2 ring-accent/40' : 'border-transparent'}`}
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="w-full sm:w-44">
        <Select id={`select-cat-icon${isInline ? '-edit' : ''}`} label="Icon" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
          {ICON_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button id="btn-save-category" variant="primary" size="sm" icon={<Check size={14} />} onClick={handleSave}>
          Save
        </Button>
        <Button id="btn-cancel-category" variant="ghost" size="sm" icon={<X size={14} />} onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(defaultForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.unit.trim()) errs.unit = 'Unit is required.';
    return errs;
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, unit: cat.unit, color: cat.color, icon: cat.icon });
    setShowForm(false);
    setErrors({});
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, form);
        setEditingId(null);
      } else {
        await addCategory(form);
        setShowForm(false);
      }
      setForm(defaultForm());
      setErrors({});
    } catch (err: unknown) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Gagal menyimpan kategori')
          : err instanceof Error
            ? err.message
            : 'Gagal menyimpan kategori';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        await deleteCategory(id);
      } catch (err: unknown) {
        const errorMessage =
          typeof err === 'object' && err !== null && 'response' in err
            ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Gagal menghapus kategori')
            : err instanceof Error
              ? err.message
              : 'Gagal menghapus kategori';
        toast.error(errorMessage);
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
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">Categories</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">Define what you want to track and how.</p>
        </div>
        {!showForm && !editingId && (
          <Button
            className="sm:text-sm sm:text-muted"
            id="btn-new-category"
            variant="primary"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => {
              setShowForm(true);
              setForm(defaultForm());
            }}
          >
            New category
          </Button>
        )}
      </div>

      {/* New category form */}
      {showForm && (
        <Card className="p-4! sm:p-5!">
          <h2 className="text-sm font-semibold text-foreground mb-4">New category</h2>
          <CategoryForm form={form} setForm={setForm} errors={errors} handleSave={handleSave} handleCancel={handleCancel} />
        </Card>
      )}

      {/* Category list */}
      <div className="space-y-2.5">
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          const isEditing = editingId === cat.id;
          const isDeleting = deleteConfirm === cat.id;

          return (
            <div key={cat.id}>
              <Card className={`p-3.5! sm:p-4! transition-colors ${isEditing ? 'border-accent/30 bg-accent/5!' : ''}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Icon preview */}
                  <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: `${cat.color}1a` }}>
                    <Icon size={18} style={{ color: cat.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
                    <p className="text-xs text-muted truncate">{cat.unit}</p>
                  </div>

                  {/* Color swatch */}
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: cat.color }} title={cat.color} />

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-cat-${cat.id}`}
                        onClick={() => startEdit(cat)}
                        className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-md transition-colors min-w-9 min-h-9 flex items-center justify-center cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        id={`btn-delete-cat-${cat.id}`}
                        onClick={() => handleDelete(cat.id)}
                        className={`p-2 rounded-md transition-colors min-w-9 min-h-9 flex items-center justify-center cursor-pointer ${isDeleting ? 'bg-red-500 text-white' : 'text-muted hover:text-red-400 hover:bg-surface'}`}
                        title={isDeleting ? 'Click again to confirm delete' : 'Delete'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="border-t border-border">
                    <CategoryForm form={form} setForm={setForm} errors={errors} isInline handleSave={handleSave} handleCancel={handleCancel} />
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-sm">No categories yet. Create your first one above.</p>
        </div>
      )}
    </div>
  );
}
