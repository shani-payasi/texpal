// Tax Calculation Service - tax slabs ke hisaab se tax calculate karo

// Progressive tax slabs pe tax calculate karo (slab-wise breakdown ke saath)
const calculateProgressiveTax = (taxableIncome, taxSlabs) => {
  let totalBaseTax = 0;
  const slabBreakdown = [];

  // Slabs ko income ke order mein sort karo
  const sortedSlabs = [...taxSlabs].sort((a, b) => a.minIncome - b.minIncome);

  for (let i = 0; i < sortedSlabs.length; i++) {
    const slab = sortedSlabs[i];
    const min = slab.minIncome;
    const max = (slab.maxIncome !== null && slab.maxIncome !== undefined) ? slab.maxIncome : Infinity;

    // Rate ko decimal mein convert karo (5 -> 0.05, already 0.05 -> 0.05)
    const rate = slab.rate > 1 ? slab.rate / 100 : slab.rate;

    // Agar income is slab tak nahi pahunchi
    if (taxableIncome <= min) {
      slabBreakdown.push({
        min,
        max: max === Infinity ? 'Above' : max,
        ratePercent: (rate * 100).toFixed(1) + '%',
        taxableInSlab: 0,
        taxForSlab: 0,
      });
      continue;
    }

    // Is slab mein kitni income taxable hai
    const slabCapacity = max - min;
    const taxableInThisSlab = Math.min(Math.max(0, taxableIncome - min), slabCapacity);
    const taxForThisSlab = taxableInThisSlab * rate;

    totalBaseTax += taxForThisSlab;

    slabBreakdown.push({
      min,
      max: max === Infinity ? 'Above' : max,
      ratePercent: (rate * 100).toFixed(1) + '%',
      taxableInSlab: Math.round(taxableInThisSlab * 100) / 100,
      taxForSlab: Math.round(taxForThisSlab * 100) / 100,
    });
  }

  return {
    baseTax: Math.round(totalBaseTax * 100) / 100,
    slabBreakdown,
  };
};

// Full tax estimate calculate karo - income, expenses, deductions sab ke saath
const calculateTaxEstimate = ({
  totalIncome = 0,
  otherIncome = 0,
  businessExpenses = 0,
  claimedDeductions = 0,
  taxProfile,
  quarter = 'Annual',
}) => {
  // Tax profile hona chahiye
  if (!taxProfile) {
    throw new Error(
      'Tax profile not found for the selected jurisdiction and financial year. Please verify your tax settings.'
    );
  }

  // Step 1: Gross income nikalo
  const grossIncome = Math.max(0, Number(totalIncome) + Number(otherIncome));

  // Step 2: Business expenses minus karo
  const validBusinessExpenses = Math.max(0, Number(businessExpenses));
  const netBusinessIncome = Math.max(0, grossIncome - validBusinessExpenses);

  // Step 3: Standard deduction apply karo
  const standardDeduction = Number(taxProfile.standardDeduction || 0);

  // Step 4: Total deductions calculate karo
  const totalDeductions = Math.max(0, Number(claimedDeductions)) + standardDeduction;

  // Step 5: Taxable income nikalo
  const taxableIncome = Math.max(0, netBusinessIncome - totalDeductions);

  // Step 6: Slab wise tax calculate karo
  const { baseTax, slabBreakdown } = calculateProgressiveTax(
    taxableIncome,
    taxProfile.taxSlabs || []
  );

  // Step 7: Cess/surcharge add karo
  const cessRate = Number(taxProfile.cessRate || 0);
  const cessAmount = Math.round(baseTax * cessRate * 100) / 100;
  const annualEstimatedTax = Math.round((baseTax + cessAmount) * 100) / 100;

  // Step 8: Effective tax rate nikalo
  let effectiveTaxRate = 0;
  if (grossIncome > 0) {
    effectiveTaxRate = Math.round((annualEstimatedTax / grossIncome) * 10000) / 100;
  }

  // Step 9: Quarterly tax nikalo
  const quarterlyEstimatedTax = Math.round((annualEstimatedTax / 4) * 100) / 100;

  // Final result return karo
  return {
    country: taxProfile.country,
    region: taxProfile.region,
    financialYear: taxProfile.financialYear,
    regime: taxProfile.regime,
    quarter,
    grossIncome,
    otherIncome: Number(otherIncome),
    businessExpenses: validBusinessExpenses,
    netBusinessIncome,
    standardDeduction,
    claimedDeductions: Number(claimedDeductions),
    totalDeductions,
    taxableIncome,
    baseTax,
    cessRate: cessRate * 100,
    cessAmount,
    annualEstimatedTax,
    quarterlyEstimatedTax,
    effectiveTaxRate,
    slabBreakdown,
    disclaimer:
      taxProfile.disclaimer ||
      'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
  };
};

module.exports = {
  calculateProgressiveTax,
  calculateTaxEstimate,
};
