import React, { useState } from 'react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  'Financial Summary',
  'Income Statement',
  'Expense Statement',
  'Tax Report',
  'Budget Report',
  'Detailed Transactions',
];

const PERIODS = [
  'Current Month',
  'Previous Month',
  'Current Quarter',
  'Previous Quarter',
  'Current Year',
  'Custom Date Range',
];

const ReportGenerator = ({ onGenerate, loading = false }) => {
  const [reportType, setReportType] = useState('Financial Summary');
  const [period, setPeriod] = useState('Current Month');
  const [format, setFormat] = useState('pdf');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (period === 'Custom Date Range' && (!customStartDate || !customEndDate)) {
      toast.error('Please select both start and end dates for custom range');
      return;
    }

    onGenerate({
      reportType,
      period,
      format,
      customStartDate,
      customEndDate,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle mb-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Generate Financial Statement</h3>
          <p className="text-xs text-slate-400">
            Export audit-ready PDF reports or raw CSV spreadsheets
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Financial Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Export Format (PDF / CSV) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  format === 'pdf'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-rose-500" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  format === 'csv'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range if selected */}
        {period === 'Custom Date Range' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FormInput
              label="Start Date"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Download}
          >
            Generate & Download Statement
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;

