import React from 'react';
import { Edit2, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';

const TransactionTable = ({
  transactions = [],
  onEdit,
  onDelete,
  loading = false,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const dateFormat = user?.preferences?.dateFormat || 'YYYY-MM-DD';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
          <tr>
            <th className="py-3 px-4">Transaction</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                {/* Description & Type Icon */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                        {tx.description}
                      </p>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category Badge */}
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${tx.categoryId?.color || '#6366F1'}15`,
                      color: tx.categoryId?.color || '#6366F1',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tx.categoryId?.color || '#6366F1' }}
                    />
                    {tx.categoryId?.name || 'Uncategorized'}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3 px-4 text-slate-500 text-xs">
                  {formatDate(tx.date, dateFormat)}
                </td>

                {/* Amount */}
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-bold text-sm ${
                      isIncome ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;

