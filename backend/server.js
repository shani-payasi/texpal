const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');
const initTaxReminderJob = require('./jobs/taxReminderJob');
const TaxProfile = require('./models/TaxProfile');

const PORT = process.env.PORT || 5000;

// Seed base tax profiles if none exist in the database
const seedInitialTaxProfiles = async () => {
  try {
    const count = await TaxProfile.countDocuments();
    if (count === 0) {
      console.log('Seeding initial verified tax profiles...');
      await TaxProfile.create([
        {
          country: 'India',
          region: 'All',
          financialYear: '2024-2025',
          regime: 'New Regime (Section 115BAC)',
          standardDeduction: 75000,
          cessRate: 0.04,
          taxSlabs: [
            { minIncome: 0, maxIncome: 300000, rate: 0 },
            { minIncome: 300000, maxIncome: 700000, rate: 0.05 },
            { minIncome: 700000, maxIncome: 1000000, rate: 0.10 },
            { minIncome: 1000000, maxIncome: 1200000, rate: 0.15 },
            { minIncome: 1200000, maxIncome: 1500000, rate: 0.20 },
            { minIncome: 1500000, maxIncome: null, rate: 0.30 },
          ],
          deductions: [
            { code: '80CCD(2)', name: 'Employer NPS Contribution', maxLimit: 200000, description: 'Under Section 80CCD(2)' },
          ],
          effectiveFrom: new Date('2024-04-01'),
          effectiveTo: new Date('2025-03-31'),
          isVerified: true,
          disclaimer:
            'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
        },
        {
          country: 'India',
          region: 'All',
          financialYear: '2024-2025',
          regime: 'Old Regime (Presumptive 44ADA / Regular)',
          standardDeduction: 50000,
          cessRate: 0.04,
          taxSlabs: [
            { minIncome: 0, maxIncome: 250000, rate: 0 },
            { minIncome: 250000, maxIncome: 500000, rate: 0.05 },
            { minIncome: 500000, maxIncome: 1000000, rate: 0.20 },
            { minIncome: 1000000, maxIncome: null, rate: 0.30 },
          ],
          deductions: [
            { code: '80C', name: 'PPF, ELSS, Life Insurance', maxLimit: 150000, description: 'Max ₹1,50,000 under section 80C' },
            { code: '80D', name: 'Health Insurance Premium', maxLimit: 50000, description: 'Medical insurance deduction' },
          ],
          effectiveFrom: new Date('2024-04-01'),
          effectiveTo: new Date('2025-03-31'),
          isVerified: true,
          disclaimer:
            'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
        },
        {
          country: 'United States',
          region: 'Federal',
          financialYear: '2024',
          regime: 'Freelancer / Self-Employed (Single)',
          standardDeduction: 14600,
          cessRate: 0,
          taxSlabs: [
            { minIncome: 0, maxIncome: 11600, rate: 0.10 },
            { minIncome: 11600, maxIncome: 47150, rate: 0.12 },
            { minIncome: 47150, maxIncome: 100525, rate: 0.22 },
            { minIncome: 100525, maxIncome: 191950, rate: 0.24 },
            { minIncome: 191950, maxIncome: 243725, rate: 0.32 },
            { minIncome: 243725, maxIncome: 609350, rate: 0.35 },
            { minIncome: 609350, maxIncome: null, rate: 0.37 },
          ],
          deductions: [
            { code: 'SE-DED', name: '50% Self-Employment Tax Deduction', maxLimit: 50000, description: 'Deductible half of SE tax' },
            { code: 'QBI', name: 'Qualified Business Income (Section 199A)', maxLimit: 50000, description: 'Up to 20% deduction on eligible profit' },
          ],
          effectiveFrom: new Date('2024-01-01'),
          effectiveTo: new Date('2024-12-31'),
          isVerified: true,
          disclaimer:
            'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
        },
      ]);
      console.log('Initial tax profiles seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding initial tax profiles:', error.message);
  }
};

const startServer = async () => {
  await connectDB();
  await seedInitialTaxProfiles();

  // Start cron reminder job
  initTaxReminderJob();

  app.listen(PORT, () => {
    console.log(`TaxPal Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

