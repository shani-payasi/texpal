import React, { useState } from 'react';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import {
  User,
  Sliders,
  Bell,
  Shield,
  Save,
  Key,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [region, setRegion] = useState(user?.region || '');
  const [incomeBracket, setIncomeBracket] = useState(user?.incomeBracket || 'medium');

  // Preferences fields
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [dateFormat, setDateFormat] = useState(user?.preferences?.dateFormat || 'YYYY-MM-DD');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [financialYearStart, setFinancialYearStart] = useState(
    user?.preferences?.financialYearStart || 'April'
  );

  // Notification toggles
  const [budgetAlerts, setBudgetAlerts] = useState(user?.preferences?.budgetAlerts ?? true);
  const [taxReminders, setTaxReminders] = useState(user?.preferences?.taxReminders ?? true);
  const [monthlySummary, setMonthlySummary] = useState(user?.preferences?.monthlySummary ?? true);

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await userService.updateProfile({
        name,
        username,
        email,
        country,
        region,
        incomeBracket,
        currency,
        preferences: {
          dateFormat,
          theme,
          financialYearStart,
          budgetAlerts,
          taxReminders,
          monthlySummary,
        },
      });
      updateUser(res.user);
      toast.success('Settings updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update settings';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Account & Application Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage personal credentials, tax jurisdictions, currency symbols, and notification alerts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormInput
              label="State / Province"
              value={region}
              placeholder="e.g. California / Maharashtra"
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Country of Residence
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Income Bracket
              </label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="low">Early Stage (&lt; $30,000 / ₹5,00,000)</option>
                <option value="medium">Established ($30,000 - $100,000 / ₹5L - ₹15L)</option>
                <option value="high">High Earner (&gt; $100,000 / ₹15,00,000+)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button type="submit" variant="primary" loading={savingProfile} icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Regional & Localization Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD (CA$) - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-11-10)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (10/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (11/10/2026)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Financial Year Starts In
              </label>
              <select
                value={financialYearStart}
                onChange={(e) => setFinancialYearStart(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="April">April (India, UK)</option>
                <option value="January">January (Calendar Year - US, Europe)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="light">Light Lavender (SaaS Default)</option>
                <option value="dark">Dark Slate</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button type="submit" variant="primary" loading={savingProfile} icon={Save}>
              Save Preferences
            </Button>
          </div>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Alert & Notification Settings
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Budget Exceeded Alerts</p>
                <p className="text-[11px] text-slate-500">
                  Notify immediately when spending in any category crosses 75% or 100% of its monthly limit.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={taxReminders}
                onChange={(e) => setTaxReminders(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Quarterly Tax Deadlines Reminders</p>
                <p className="text-[11px] text-slate-500">
                  Receive advance warnings 15 days before quarterly estimated tax payments are due.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={monthlySummary}
                onChange={(e) => setMonthlySummary(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Monthly Cashflow Summaries</p>
                <p className="text-[11px] text-slate-500">
                  Generate periodic digest reports summarizing net profit, deductible expenses, and savings rate.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button type="submit" variant="primary" loading={savingProfile} icon={Save}>
              Save Notification Settings
            </Button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
            Change Password
          </h3>

          <div className="space-y-3 max-w-md">
            <FormInput
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <FormInput
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of All Sessions
            </button>

            <Button type="submit" variant="primary" loading={savingPassword} icon={Key}>
              Update Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
