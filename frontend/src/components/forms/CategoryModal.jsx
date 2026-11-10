import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#6366F1', '#4F46E5', '#10B981', '#059669', '#EF4444',
  '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#3B82F6',
];

const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  category = null,
  initialType = 'expense',
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(initialType);
  const [color, setColor] = useState('#6366F1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color || '#6366F1');
    } else {
      setName('');
      setType(initialType);
      setColor('#6366F1');
    }
  }, [category, initialType, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        type,
        color,
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save category';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create Custom Category'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector (only when creating new) */}
        {!category && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Income Category
              </button>
            </div>
          </div>
        )}

        <FormInput
          label="Category Name"
          placeholder="e.g. Cloud Hosting, Client Retainer..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Badge Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-110 border-slate-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {category ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;

