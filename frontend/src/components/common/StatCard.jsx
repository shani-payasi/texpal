import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  variant = 'default', // 'income', 'expense', 'brand', 'warning'
  subtitle,
}) => {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;

  const iconStyles = {
    income: 'bg-emerald-50 text-emerald-600',
    expense: 'bg-rose-50 text-rose-600',
    brand: 'bg-brand-50 text-brand-600',
    warning: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    default: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-subtle hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconStyles[variant] || iconStyles.default}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h2>
      </div>

      <div className="flex items-center text-xs">
        {change !== undefined && change !== null ? (
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md ${
                isPositive
                  ? variant === 'expense'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-emerald-600 bg-emerald-50'
                  : isNegative
                  ? variant === 'expense'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-rose-600 bg-rose-50'
                  : 'text-slate-500 bg-slate-50'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : isNegative ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-slate-400 font-normal">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 font-medium">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;

