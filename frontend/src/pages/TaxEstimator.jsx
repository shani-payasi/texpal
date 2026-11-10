import React, { useState, useEffect } from 'react';
import TaxCalculationForm from '../components/forms/TaxCalculationForm';
import TaxBreakdownChart from '../components/charts/TaxBreakdownChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Calculator, History, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { useAuth } from '../context/AuthContext';
import { taxService } from '../services/taxService';
import toast from 'react-hot-toast';

const TaxEstimator = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [profiles, setProfiles] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [currentEstimate, setCurrentEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, estimatesRes] = await Promise.all([
        taxService.getProfiles(),
        taxService.getEstimates(),
      ]);

      setProfiles(profilesRes.profiles || []);
      const userEstimates = estimatesRes.estimates || [];
      setEstimates(userEstimates);

      if (userEstimates.length > 0) {
        setCurrentEstimate(userEstimates[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load tax profiles or historical estimates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCalculateTax = async (formData) => {
    try {
      setCalculating(true);
      const res = await taxService.calculate(formData);
      setCurrentEstimate(res.estimate);
      toast.success('Estimated tax calculation computed & saved!');
      // Refresh historical estimates
      const estimatesRes = await taxService.getEstimates();
      setEstimates(estimatesRes.estimates || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to calculate tax estimate';
      toast.error(msg);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading official tax profiles and historical estimates..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Freelance Tax Estimator & Progressive Slab Calculator
        </h2>
        <p className="text-xs text-slate-500">
          Compute accurate quarterly and annual tax liabilities according to verified jurisdiction rules
        </p>
      </div>

      {/* Calculator Input Form */}
      <TaxCalculationForm
        profiles={profiles}
        onCalculate={handleCalculateTax}
        loading={calculating}
        userCountry={user?.country || 'India'}
      />

      {/* Result Breakdown Chart & Slabs Display */}
      {currentEstimate && <TaxBreakdownChart estimate={currentEstimate} />}

      {/* Historical Estimates Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">Tax Calculations History</h3>
          </div>
          <span className="text-xs text-slate-400">{estimates.length} calculations saved</span>
        </div>

        {estimates.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No tax estimates computed yet. Fill out the calculator above to generate your first projection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date & Jurisdiction</th>
                  <th className="py-3 px-4">Financial Year</th>
                  <th className="py-3 px-4 text-right">Gross Income</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Taxable Income</th>
                  <th className="py-3 px-4 text-right">Estimated Tax</th>
                  <th className="py-3 px-4 text-right">Quarterly Tax</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimates.map((est) => (
                  <tr
                    key={est._id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      currentEstimate?._id === est._id ? 'bg-purple-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{est.country}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(est.createdAt)}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {est.financialYear} ({est.quarter})
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatCurrency(est.totalIncome, currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-blue-600">
                      {formatCurrency(est.deductions, currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(est.taxableIncome, currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      {formatCurrency(est.estimatedTax, currency)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-purple-600">
                      {formatCurrency(est.quarterlyEstimatedTax, currency)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setCurrentEstimate(est)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxEstimator;
