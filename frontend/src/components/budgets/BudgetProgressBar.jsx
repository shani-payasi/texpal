import React from 'react';

const BudgetProgressBar = ({ percentage, status }) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const barColors = {
    Good: 'bg-emerald-500',
    Warning: 'bg-amber-500',
    Exceeded: 'bg-rose-500',
  };

  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          barColors[status] || 'bg-brand-500'
        }`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
};

export default BudgetProgressBar;

