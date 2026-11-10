import React, { useState, useEffect } from 'react';
import StatCardGrid from '../components/dashboard/StatCardGrid';
import QuickActions from '../components/dashboard/QuickActions';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';
import BudgetProgressWidget from '../components/dashboard/BudgetProgressWidget';
import TransactionModal from '../components/transactions/TransactionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { taxService } from '../services/taxService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  // dashboard ka saara data state mein store karo
  const [summary, setSummary] = useState({});
  const [budgetSummary, setBudgetSummary] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [latestTaxEstimate, setLatestTaxEstimate] = useState(0);
  const [loading, setLoading] = useState(true);

  // modal ke liye states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income');

  // saara dashboard data ek saath fetch karo
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // parallel mein saare API calls karo
      const [sumRes, bSumRes, txRes, taxRes] = await Promise.all([
        transactionService.getSummary(),
        budgetService.getSummary(),
        transactionService.getAll({ limit: 5, sortBy: 'date', sortOrder: 'desc' }),
        taxService.getEstimates(),
      ]);

      setSummary(sumRes.summary || {});
      setBudgetSummary(bSumRes.summary || {});
      setRecentTransactions(txRes.transactions || []);

      // latest tax estimate nikalo
      if (taxRes.estimates && taxRes.estimates.length > 0) {
        setLatestTaxEstimate(taxRes.estimates[0].estimatedTax || 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Could not fetch latest financial summary');
    } finally {
      setLoading(false);
    }
  };

  // page load hone pe data fetch karo
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // nayi transaction record karo
  const handleRecordTransaction = async (formData) => {
    await transactionService.create(formData);

    // success message dikhao
    const message = formData.type === 'income' ? 'Income' : 'Expense';
    toast.success(`${message} recorded successfully!`);

    // dashboard data refresh karo
    fetchDashboardData();
  };

  // income add karne ka modal kholo
  const openAddIncome = () => {
    setModalType('income');
    setModalOpen(true);
  };

  // expense add karne ka modal kholo
  const openAddExpense = () => {
    setModalType('expense');
    setModalOpen(true);
  };

  // loading spinner dikhao jab tak data nahi aata
  if (loading) {
    return <LoadingSpinner text="Compiling financial metrics & tax estimates..." size="lg" />;
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Financial Health & Tax Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Real-time cashflow metrics, budget thresholds, and progressive tax estimates
          </p>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <StatCardGrid
        summary={summary}
        budgetSummary={budgetSummary}
        latestTax={latestTaxEstimate}
      />

      {/* Quick Action Buttons - income/expense add karo */}
      <QuickActions
        onAddIncome={openAddIncome}
        onAddExpense={openAddExpense}
      />

      {/* Charts Row - income vs expense graph aur pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={summary.monthlyTrend || []} />
        </div>
        <div className="lg:col-span-1">
          <ExpensePieChart
            data={summary.expenseBreakdown || []}
            totalExpense={summary.monthlyExpenses || 0}
          />
        </div>
      </div>

      {/* Recent Transactions aur Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsWidget transactions={recentTransactions} />
        <BudgetProgressWidget budgets={budgetSummary.budgets || []} />
      </div>

      {/* Transaction Add Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRecordTransaction}
        initialType={modalType}
      />
    </div>
  );
};

export default Dashboard;
