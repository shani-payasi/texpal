import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';

const RecentTransactionsWidget = ({ transactions = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const dateFormat = user?.preferences?.dateFormat || 'YYYY-MM-DD';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
          <p className="text-xs text-slate-400">Latest recorded income & expenses</p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent transactions recorded
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div key={tx._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {tx.description}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{tx.categoryId?.name || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date, dateFormat)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-3">
                  <span
                    className={`text-xs font-bold ${
                      isIncome ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;

