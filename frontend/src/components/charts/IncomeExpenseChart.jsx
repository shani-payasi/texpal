import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const IncomeExpenseChart = ({ data = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [timeframe, setTimeframe] = useState('6M');

  // Filter or slice data based on timeframe button
  let displayData = [...data];
  if (timeframe === '3M') {
    displayData = displayData.slice(-3);
  } else if (timeframe === '6M') {
    displayData = displayData.slice(-6);
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-700 mb-1.5">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 font-medium">
              Income: <span className="font-bold">{formatCurrency(payload[0]?.value, currency)}</span>
            </p>
            <p className="text-rose-500 font-medium">
              Expenses: <span className="font-bold">{formatCurrency(payload[1]?.value, currency)}</span>
            </p>
            {payload[0] && payload[1] && (
              <p className="text-brand-600 font-medium pt-1 border-t border-slate-100">
                Net Savings: <span className="font-bold">{formatCurrency(payload[0].value - payload[1].value, currency)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-2 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">Income vs Expenses</h3>
          <p className="text-xs text-slate-400">Cashflow tracking across recent months</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['3M', '6M', 'All'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeframe === t
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {displayData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No transaction trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IncomeExpenseChart;

