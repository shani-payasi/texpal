import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Tag,
  Calculator,
  Calendar,
  FileText,
  Settings,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Tax Estimator', href: '/tax-estimator', icon: Calculator },
  { name: 'Tax Calendar', href: '/tax-calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ₹$
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-800 tracking-tight leading-none">
                Tax<span className="text-brand-600">Pal</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">
                Freelancer Suite
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Pro / Disclaimer Footer Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-lavender-50 rounded-xl p-3 border border-brand-100/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-800 mb-1">
              <ShieldAlert className="w-4 h-4 text-brand-600" />
              <span>Tax Disclaimer</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Calculations are estimates for budgeting purposes. Consult an accountant for filings.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

