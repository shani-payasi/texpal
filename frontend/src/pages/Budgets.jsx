import React, { useState, useEffect } from 'react';
import BudgetModal from '../components/budgets/BudgetModal';
import BudgetProgressBar from '../components/budgets/BudgetProgressBar';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  PieChart,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { budgetService } from '../services/budgetService';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Budgets = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetService.getSummary(selectedMonth, selectedYear);
      setSummary(res.summary || {});
      setBudgets(res.summary?.budgets || []);
    } catch (err) {
      console.error('Failed to load budgets:', err);
      toast.error('Could not fetch monthly budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleCreateOrUpdate = async (formData) => {
    if (selectedBudget) {
      await budgetService.update(selectedBudget._id, formData);
      toast.success('Budget updated successfully');
    } else {
      await budgetService.create(formData);
      toast.success('Budget created successfully');
    }
    fetchBudgets();
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;
    try {
      setActionLoading(true);
      await budgetService.delete(budgetToDelete._id);
      toast.success('Budget deleted');
      setDeleteConfirmOpen(false);
      setBudgetToDelete(null);
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to remove budget');
    } finally {
      setActionLoading(false);
    }
  };

  const totalBudget = summary.totalBudget || 0;
  const totalSpent = summary.totalSpent || 0;
  const remainingBudget = summary.remainingBudget || 0;
  const overallHealth = summary.overallHealth || 'Good';

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Monthly Budget Management
          </h2>
          <p className="text-xs text-slate-500">
            Monitor real-time expense thresholds, status indicators, and spending progress
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Month / Year Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => {
              setSelectedBudget(null);
              setModalOpen(true);
            }}
          >
            Create Budget
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle">
          <p className="text-xs uppercase font-bold text-slate-400">Total Monthly Budget</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {formatCurrency(totalBudget, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {budgets.length} configured expense categories
          </p>
        </div>

        {/* Currently Spent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle">
          <p className="text-xs uppercase font-bold text-slate-400">Currently Spent</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">
            {formatCurrency(totalSpent, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of budget utilized
          </p>
        </div>

        {/* Remaining Amount */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle">
          <p className="text-xs uppercase font-bold text-slate-400">Remaining Balance</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(remainingBudget, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Unallocated monthly cushion</p>
        </div>

        {/* Budget Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl flex-shrink-0 ${
              overallHealth === 'Good'
                ? 'bg-emerald-50 text-emerald-600'
                : overallHealth === 'Warning'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {overallHealth === 'Good' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : overallHealth === 'Warning' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <AlertOctagon className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">Budget Health</p>
            <h3
              className={`text-lg font-bold ${
                overallHealth === 'Good'
                  ? 'text-emerald-700'
                  : overallHealth === 'Warning'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {overallHealth === 'Good'
                ? 'Healthy (<75%)'
                : overallHealth === 'Warning'
                ? 'Warning (75-100%)'
                : 'Exceeded (>100%)'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {summary.statusCounts?.exceeded || 0} category over limit
            </p>
          </div>
        </div>
      </div>

      {/* Budgets Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Category Allocations
            </h3>
            <p className="text-xs text-slate-400">
              Calculated automatically against actual expense transaction records
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Aggregating expense records and budget limits..." />
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="No budgets set for this month"
            description="Set monthly spending limits for categories like Software, Rent, and Marketing to get automatic alerts before exceeding."
            actionLabel="Create Budget"
            onAction={() => {
              setSelectedBudget(null);
              setModalOpen(true);
            }}
            actionIcon={PlusCircle}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Budget Limit</th>
                  <th className="py-3 px-4 text-right">Actual Spent</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                  <th className="py-3 px-4 w-44">Spending Progress</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Category */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.category?.color || '#6366F1' }}
                        />
                        <span>{b.category?.name || 'Category'}</span>
                      </div>
                      {b.description && (
                        <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {b.description}
                        </p>
                      )}
                    </td>

                    {/* Limit */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {formatCurrency(b.limit, currency)}
                    </td>

                    {/* Spent */}
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(b.spent, currency)}
                    </td>

                    {/* Remaining */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-bold ${
                          b.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(b.remaining, currency)}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <BudgetProgressBar percentage={b.percentage} status={b.status} />
                        <span className="text-[10px] text-slate-400 font-medium block text-right">
                          {b.percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          b.status === 'Good'
                            ? 'success'
                            : b.status === 'Warning'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedBudget(b);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Limit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setBudgetToDelete(b);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBudget(null);
        }}
        onSubmit={handleCreateOrUpdate}
        budget={selectedBudget}
        initialMonth={selectedMonth}
        initialYear={selectedYear}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBudgetToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Budget"
        message={`Are you sure you want to remove the monthly budget for "${budgetToDelete?.category?.name}"?`}
        confirmText="Remove"
        loading={actionLoading}
      />
    </div>
  );
};

export default Budgets;
