import React from 'react';
import { PlusCircle, MinusCircle, Calculator, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ onAddIncome, onAddExpense }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <button
        onClick={onAddIncome}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-subtle hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left group"
      >
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Add Income</p>
          <p className="text-[11px] text-slate-400">Record payout</p>
        </div>
      </button>

      <button
        onClick={onAddExpense}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-subtle hover:border-rose-200 hover:bg-rose-50/30 transition-all text-left group"
      >
        <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
          <MinusCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Add Expense</p>
          <p className="text-[11px] text-slate-400">Log deductible cost</p>
        </div>
      </button>

      <button
        onClick={() => navigate('/tax-estimator')}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-subtle hover:border-brand-200 hover:bg-brand-50/30 transition-all text-left group"
      >
        <div className="p-2 rounded-xl bg-brand-50 text-brand-600 group-hover:scale-105 transition-transform">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Tax Estimator</p>
          <p className="text-[11px] text-slate-400">Calculate slabs</p>
        </div>
      </button>

      <button
        onClick={() => navigate('/reports')}
        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-subtle hover:border-purple-200 hover:bg-purple-50/30 transition-all text-left group"
      >
        <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
          <FileDown className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Download Reports</p>
          <p className="text-[11px] text-slate-400">PDF & CSV export</p>
        </div>
      </button>
    </div>
  );
};

export default QuickActions;

