import React, { useState, useEffect } from 'react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { Calculator, AlertCircle, Info } from 'lucide-react';

const TaxCalculationForm = ({
  profiles = [],
  onCalculate,
  loading = false,
  userCountry = 'India',
}) => {
  const [country, setCountry] = useState(userCountry);
  const [financialYear, setFinancialYear] = useState('2024-2025');
  const [regime, setRegime] = useState('');
  const [quarter, setQuarter] = useState('Annual');
  const [totalIncome, setTotalIncome] = useState('');
  const [businessExpenses, setBusinessExpenses] = useState('');
  const [eligibleDeductions, setEligibleDeductions] = useState('');
  const [otherIncome, setOtherIncome] = useState('');

  // Extract unique countries from configured profiles
  const availableCountries = Array.from(new Set(profiles.map((p) => p.country)));

  // Filter profiles for current selected country
  const filteredProfiles = profiles.filter(
    (p) => p.country.toLowerCase() === country.toLowerCase()
  );

  useEffect(() => {
    if (filteredProfiles.length > 0) {
      setFinancialYear(filteredProfiles[0].financialYear);
      setRegime(filteredProfiles[0].regime);
    }
  }, [country, profiles]);

  const selectedProfile = filteredProfiles.find(
    (p) => p.financialYear === financialYear && (!regime || p.regime === regime)
  ) || filteredProfiles[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate({
      country,
      financialYear,
      regime: selectedProfile?.regime || regime,
      quarter,
      totalIncome: Number(totalIncome) || 0,
      businessExpenses: Number(businessExpenses) || 0,
      eligibleDeductions: Number(eligibleDeductions) || 0,
      otherIncome: Number(otherIncome) || 0,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-subtle mb-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Freelance Tax Estimator Engine
          </h3>
          <p className="text-xs text-slate-400">
            Calculates taxable income & progressive tax slabs using verified tax profiles
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Jurisdiction & Profile Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Country / Jurisdiction
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              {availableCountries.length > 0 ? (
                availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              ) : (
                <>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Financial Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              {filteredProfiles.map((p) => (
                <option key={p._id} value={p.financialYear}>
                  {p.financialYear} ({p.regime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Regime / Tax System
            </label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              {filteredProfiles.map((p) => (
                <option key={p._id} value={p.regime}>
                  {p.regime}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quarter or Annual
            </label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            >
              <option value="Annual">Full Financial Year (Annual)</option>
              <option value="Q1">Quarter 1</option>
              <option value="Q2">Quarter 2</option>
              <option value="Q3">Quarter 3</option>
              <option value="Q4">Quarter 4</option>
            </select>
          </div>
        </div>

        {/* Financial Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <FormInput
            label="Gross Freelance Income"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 75000"
            value={totalIncome}
            onChange={(e) => setTotalIncome(e.target.value)}
            required
            helperText="Total billable earnings"
          />

          <FormInput
            label="Deductible Business Expenses"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 15000"
            value={businessExpenses}
            onChange={(e) => setBusinessExpenses(e.target.value)}
            helperText="Software, gear, studio rent"
          />

          <FormInput
            label="Eligible Tax Deductions"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 5000"
            value={eligibleDeductions}
            onChange={(e) => setEligibleDeductions(e.target.value)}
            helperText={selectedProfile?.deductions?.map((d) => d.code).join(', ') || 'Retirement, insurance'}
          />

          <FormInput
            label="Other / Passive Income"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 2000"
            value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)}
            helperText="Dividends, interest, courses"
          />
        </div>

        {/* Info note */}
        {selectedProfile && (
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-600" />
            <div>
              <p className="font-semibold">
                Configured Profile: {selectedProfile.regime}
              </p>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Standard Deduction: ${selectedProfile.standardDeduction?.toLocaleString()} • Slabs:{' '}
                {selectedProfile.taxSlabs?.length} tiers • Cess/Health Tax: {selectedProfile.cessRate * 100}%
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Calculator}
          >
            Compute Estimated Tax
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaxCalculationForm;

