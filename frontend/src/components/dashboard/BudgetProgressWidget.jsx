import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import BudgetProgressBar from '../budgets/BudgetProgressBar';

const BudgetProgressWidget = ({ budgets = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">Budget Health</h3>
          <p className="text-xs text-slate-400">Monthly category spending status</p>
        </div>
        <Link
          to="/budgets"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4 flex-1 pt-1">
        {budgets.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active budgets set for this month
          </div>
        ) : (
          budgets.slice(0, 4).map((b) => (
            <div key={b._id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                  {b.category?.name || 'Category'}
                </span>
                <span className="text-slate-500 font-medium">
                  {formatCurrency(b.spent, currency)} /{' '}
                  <span className="text-slate-700 font-bold">
                    {formatCurrency(b.limit, currency)}
                  </span>
                </span>
              </div>

              <BudgetProgressBar percentage={b.percentage} status={b.status} />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span
                  className={`font-semibold ${
                    b.status === 'Good'
                      ? 'text-emerald-600'
                      : b.status === 'Warning'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {b.percentage}% spent ({b.status})
                </span>
                <span>
                  {b.remaining >= 0
                    ? `${formatCurrency(b.remaining, currency)} left`
                    : `${formatCurrency(Math.abs(b.remaining), currency)} over`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetProgressWidget;

