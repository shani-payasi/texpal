import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { useAuth } from '../context/AuthContext';
import { taxService } from '../services/taxService';
import toast from 'react-hot-toast';

const TaxCalendar = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [year, setYear] = useState(new Date().getFullYear());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [latestTaxEstimate, setLatestTaxEstimate] = useState(0);
  const [country, setCountry] = useState(user?.country || 'India');
  const [loading, setLoading] = useState(true);
  const [completedEvents, setCompletedEvents] = useState({});

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await taxService.getCalendar(country, year);
      setCalendarEvents(res.calendar || []);
      setLatestTaxEstimate(res.latestTaxEstimate || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tax calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [country, year]);

  const toggleComplete = (id) => {
    setCompletedEvents((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      toast.success(next[id] ? 'Payment marked as completed' : 'Payment marked as pending');
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Quarterly Tax Calendar & Deadlines
          </h2>
          <p className="text-xs text-slate-500">
            Jurisdiction-specific advance tax installments and estimated payment due dates
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Country Selector */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="India">India (Advance Tax)</option>
            <option value="United States">United States (Federal 1040-ES)</option>
          </select>

          {/* Year Selector */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                FY {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Banner / Info Card */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-3xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">
              Tax Season Projection
            </span>
            <h3 className="text-2xl font-black mt-1">
              {formatCurrency(latestTaxEstimate, currency)}
            </h3>
            <p className="text-xs text-brand-100 mt-1 max-w-xl">
              Based on your latest tax calculation for {country}. Split into scheduled quarterly installments below to avoid late-payment interest (e.g. 234B/234C or IRS penalties).
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              {country} Jurisdiction
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Deadlines Timeline */}
      {loading ? (
        <LoadingSpinner text="Loading tax deadline calendar..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calendarEvents.map((evt) => {
            const isCompleted = completedEvents[evt.id] || evt.status === 'completed';
            const isOverdue = evt.status === 'overdue' && !isCompleted;
            const isDueSoon = evt.status === 'due' && !isCompleted;

            return (
              <div
                key={evt.id}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isOverdue
                    ? 'border-rose-200 shadow-subtle'
                    : isDueSoon
                    ? 'border-amber-200 shadow-subtle'
                    : 'border-slate-100 shadow-subtle'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-600'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-600'
                          : isDueSoon
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-brand-50 text-brand-600'
                      }`}
                    >
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {evt.quarter} Deadline
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">{evt.title}</h4>
                    </div>
                  </div>

                  <Badge
                    variant={
                      isCompleted
                        ? 'success'
                        : isOverdue
                        ? 'danger'
                        : isDueSoon
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {isCompleted
                      ? 'Completed'
                      : isOverdue
                      ? 'Overdue'
                      : isDueSoon
                      ? 'Due Soon'
                      : 'Upcoming'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {evt.description}
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Due Date
                    </span>
                    <span className="font-bold text-slate-700">
                      {formatDate(evt.dueDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Est. Voucher Payment
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(evt.estimatedPaymentAmount, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {evt.daysRemaining >= 0
                        ? `${evt.daysRemaining} days remaining`
                        : `${Math.abs(evt.daysRemaining)} days ago`}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleComplete(evt.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                      isCompleted
                        ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                        : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isCompleted ? 'Mark Pending' : 'Mark as Paid'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaxCalendar;
