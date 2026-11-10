import React, { useState, useEffect } from 'react';
import CategoryModal from '../components/forms/CategoryModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Tag, PlusCircle, Edit2, Trash2, Lock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

const Categories = () => {
  const [activeTab, setActiveTab] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll(activeTab);
      setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeTab]);

  const handleCreateOrUpdate = async (formData) => {
    if (selectedCategory) {
      await categoryService.update(selectedCategory._id, formData);
      toast.success('Category updated successfully');
    } else {
      await categoryService.create(formData);
      toast.success('Category created successfully');
    }
    fetchCategories();
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    try {
      setActionLoading(true);
      await categoryService.delete(catToDelete._id);
      toast.success('Category deleted');
      setDeleteConfirmOpen(false);
      setCatToDelete(null);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete category';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Category Management
          </h2>
          <p className="text-xs text-slate-500">
            Customize income streams and deductible expense classifications
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => {
            setSelectedCategory(null);
            setModalOpen(true);
          }}
        >
          Add Custom Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'expense'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Expense Categories
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'income'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Income Categories
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="Create your first custom category to tailor your finance tracking."
          actionLabel="Add Category"
          onAction={() => {
            setSelectedCategory(null);
            setModalOpen(true);
          }}
          actionIcon={PlusCircle}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-subtle hover:shadow-card transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color || '#6366F1' }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400 capitalize">{cat.type}</p>
                  </div>
                </div>

                {cat.isDefault ? (
                  <span
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="System default category (protected)"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setCatToDelete(cat);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-50 text-slate-400">
                <span>{cat.isDefault ? 'Built-in Default' : 'Custom Category'}</span>
                <span
                  className="px-2 py-0.5 rounded-full font-semibold text-[10px]"
                  style={{
                    backgroundColor: `${cat.color || '#6366F1'}15`,
                    color: cat.color || '#6366F1',
                  }}
                >
                  {cat.color}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleCreateOrUpdate}
        category={selectedCategory}
        initialType={activeTab}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setCatToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${catToDelete?.name}"? You can only delete custom categories that are not currently referenced by transactions or budgets.`}
        confirmText="Delete Category"
        loading={actionLoading}
      />
    </div>
  );
};

export default Categories;
