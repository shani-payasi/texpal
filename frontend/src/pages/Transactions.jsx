import React, { useState, useEffect } from 'react';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionModal from '../components/transactions/TransactionModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { PlusCircle, ArrowLeftRight, Download } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { reportService } from '../services/reportService';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (type) params.type = type;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await transactionService.getAll(params);
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, type, category, startDate, endDate, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleCreateOrUpdate = async (formData) => {
    if (selectedTx) {
      await transactionService.update(selectedTx._id, formData);
      toast.success('Transaction updated');
    } else {
      await transactionService.create(formData);
      toast.success('Transaction recorded');
    }
    fetchTransactions();
  };

  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    try {
      setActionLoading(true);
      await transactionService.delete(txToDelete._id);
      toast.success('Transaction deleted');
      setDeleteConfirmOpen(false);
      setTxToDelete(null);
      fetchTransactions();
    } catch (err) {
      toast.error('Could not delete transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickExportCSV = async () => {
    try {
      toast.loading('Generating CSV statement...', { id: 'csv-exp' });
      const res = await reportService.generate({
        reportType: 'Detailed Transactions',
        period: 'Current Year',
        format: 'csv',
      });
      toast.success('CSV generated! Download starting...', { id: 'csv-exp' });
      window.open(reportService.getDownloadUrl(res.report._id), '_blank');
    } catch (err) {
      toast.error('CSV generation failed', { id: 'csv-exp' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Financial Transactions
          </h2>
          <p className="text-xs text-slate-500">
            Log, categorize, filter, and audit freelance income & deductible business expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={handleQuickExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
          >
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={(val) => {
          setType(val);
          setCurrentPage(1);
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setCurrentPage(1);
        }}
        startDate={startDate}
        onStartDateChange={(val) => {
          setStartDate(val);
          setCurrentPage(1);
        }}
        endDate={endDate}
        onEndDateChange={(val) => {
          setEndDate(val);
          setCurrentPage(1);
        }}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching transaction ledger..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description={
              search || type || category
                ? 'No transactions match your active filters. Try adjusting your search.'
                : 'Start tracking your business cashflow by recording your first transaction.'
            }
            actionLabel="Record Transaction"
            onAction={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
            actionIcon={PlusCircle}
          />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              onEdit={(tx) => {
                setSelectedTx(tx);
                setIsModalOpen(true);
              }}
              onDelete={(tx) => {
                setTxToDelete(tx);
                setDeleteConfirmOpen(true);
              }}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTx(null);
        }}
        onSubmit={handleCreateOrUpdate}
        transaction={selectedTx}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTxToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${txToDelete?.description}"? This will update your budget spending and monthly reports.`}
        confirmText="Yes, Delete"
        loading={actionLoading}
      />
    </div>
  );
};

export default Transactions;
