import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const TaxBreakdownChart = ({ estimate }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  if (!estimate) return null;

  const details = estimate.calculationDetails || {};
  const slabBreakdown = details.slabBreakdown || [];

  const comparisonData = [
    { name: 'Gross Income', amount: estimate.totalIncome, fill: '#10B981' },
    { name: 'Total Deductions', amount: estimate.deductions, fill: '#3B82F6' },
    { name: 'Taxable Income', amount: estimate.taxableIncome, fill: '#6366F1' },
    { name: 'Annual Tax Due', amount: estimate.estimatedTax, fill: '#EF4444' },
    { name: 'Quarterly Tax', amount: estimate.quarterlyEstimatedTax, fill: '#EC4899' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">
            Calculation Result ({estimate.financialYear})
          </span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
            Estimated Annual Tax: {formatCurrency(estimate.estimatedTax, currency)}
          </h3>
          <p className="text-xs text-slate-500">
            Effective Tax Rate:{' '}
            <strong className="text-brand-600">{estimate.effectiveTaxRate || details.effectiveTaxRate || 0}%</strong> •
            Quarterly Payment: <strong>{formatCurrency(estimate.quarterlyEstimatedTax, currency)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Configured Slabs Applied</span>
        </div>
      </div>

      {/* Visual Bar Comparison */}
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value, currency), 'Amount']}
              contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Slab Table Breakdown */}
      {slabBreakdown.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Tax Slab Tier</th>
                <th className="py-2.5 px-3">Rate</th>
                <th className="py-2.5 px-3 text-right">Income in Slab</th>
                <th className="py-2.5 px-3 text-right">Tax for Slab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slabBreakdown.map((s, idx) => (
                <tr key={idx} className={s.taxForSlab > 0 ? 'bg-amber-50/20' : ''}>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {formatCurrency(s.min, currency)} - {s.max === 'Above' ? 'Above' : formatCurrency(s.max, currency)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{s.ratePercent}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {formatCurrency(s.taxableInSlab, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                    {formatCurrency(s.taxForSlab, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Disclaimer Banner */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2 border border-slate-200/60">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>{details.disclaimer || 'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.'}</span>
      </div>
    </div>
  );
};

export default TaxBreakdownChart;

