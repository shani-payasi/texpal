import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_COLORS = [
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#64748B',
];

const ExpensePieChart = ({ data = [], totalExpense = 0 }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-800">{item.name}</p>
          <p className="text-slate-600 font-medium mt-0.5">
            {formatCurrency(item.value, currency)} ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle flex flex-col justify-between">
      <div className="pb-2">
        <h3 className="text-base font-bold text-slate-800">Expense Breakdown</h3>
        <p className="text-xs text-slate-400">Monthly spending by category</p>
      </div>

      <div className="h-56 relative flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-xs text-slate-400">No expense records this month</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent</span>
              <span className="text-base font-bold text-slate-800">
                {formatCurrency(totalExpense, currency)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Legend list */}
      <div className="mt-2 max-h-32 overflow-y-auto space-y-1.5 pr-1">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
              />
              <span className="text-slate-600 truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 font-medium">
              <span className="text-slate-700">{formatCurrency(item.value, currency)}</span>
              <span className="text-slate-400 text-[11px] w-8 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensePieChart;

