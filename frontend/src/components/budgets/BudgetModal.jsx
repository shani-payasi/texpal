import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  budget = null,
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear(),
}) => {
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.category?._id || budget.category || '');
      setLimit(budget.limit);
      setMonth(budget.month);
      setYear(budget.year);
      setDescription(budget.description || '');
    } else {
      setCategoryId('');
      setLimit('');
      setMonth(initialMonth);
      setYear(initialYear);
      setDescription('');
    }
  }, [budget, initialMonth, initialYear, isOpen]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAll('expense');
        setCategories(res.categories || []);
        if (!budget && res.categories && res.categories.length > 0) {
          setCategoryId(res.categories[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, budget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select an expense category');
      return;
    }
    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      toast.error('Valid budget limit amount is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        categoryId,
        limit: Number(limit),
        month: Number(month),
        year: Number(year),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save budget';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? 'Edit Budget' : 'Create Monthly Budget'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Expense Category <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!budget} // Cannot change category of existing budget
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:bg-slate-100 disabled:text-slate-500"
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Limit */}
        <FormInput
          label="Budget Limit Amount"
          type="number"
          step="0.01"
          min="1"
          placeholder="e.g. 500.00"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
        />

        {/* Month & Year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              disabled={!!budget}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:bg-slate-100"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={!!budget}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. SaaS spending ceiling"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;

