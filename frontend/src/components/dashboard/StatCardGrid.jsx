import React from 'react';
import StatCard from '../common/StatCard';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  PiggyBank,
  PieChart,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';

const StatCardGrid = ({ summary = {}, budgetSummary = {}, latestTax = 0 }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const monthlyIncome = summary.monthlyIncome || 0;
  const monthlyExpenses = summary.monthlyExpenses || 0;
  const incomeChange = summary.incomeChange;
  const expensesChange = summary.expensesChange;
  const savingsRate = summary.savingsRate || 0;

  const totalBudget = budgetSummary.totalBudget || 0;
  const remainingBudget = budgetSummary.remainingBudget || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* 1. Monthly Income */}
      <StatCard
        title="Monthly Income"
        value={formatCurrency(monthlyIncome, currency)}
        change={incomeChange}
        changeLabel="vs last mo"
        icon={TrendingUp}
        variant="income"
      />

      {/* 2. Monthly Expenses */}
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses, currency)}
        change={expensesChange}
        changeLabel="vs last mo"
        icon={TrendingDown}
        variant="expense"
      />

      {/* 3. Estimated Tax Due */}
      <StatCard
        title="Est. Tax Due"
        value={formatCurrency(latestTax, currency)}
        subtitle="Annualized projection"
        icon={Calculator}
        variant="purple"
      />

      {/* 4. Savings Rate */}
      <StatCard
        title="Savings Rate"
        value={`${savingsRate}%`}
        subtitle={savingsRate >= 20 ? 'Target achieved (≥20%)' : 'Needs attention'}
        icon={PiggyBank}
        variant={savingsRate >= 20 ? 'income' : 'warning'}
      />

      {/* 5. Total Budget */}
      <StatCard
        title="Total Budget"
        value={formatCurrency(totalBudget, currency)}
        subtitle={`${budgetSummary.budgetCount || 0} active categories`}
        icon={PieChart}
        variant="brand"
      />

      {/* 6. Remaining Budget */}
      <StatCard
        title="Remaining Budget"
        value={formatCurrency(remainingBudget, currency)}
        subtitle={
          budgetSummary.overallHealth === 'Good'
            ? 'Healthy balance'
            : budgetSummary.overallHealth === 'Warning'
            ? 'Warning threshold'
            : 'Budget exceeded'
        }
        icon={Wallet}
        variant={
          budgetSummary.overallHealth === 'Good'
            ? 'income'
            : budgetSummary.overallHealth === 'Warning'
            ? 'warning'
            : 'expense'
        }
      />
    </div>
  );
};

export default StatCardGrid;

