const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const TaxProfile = require('./models/TaxProfile');
const TaxEstimate = require('./models/TaxEstimate');
const Alert = require('./models/Alert');
const Report = require('./models/Report');
const { calculateTaxEstimate } = require('./services/taxCalculationService');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taxpal');
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Tax Profiles
    await TaxProfile.deleteMany({});
    const createdProfiles = await TaxProfile.insertMany([
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
        disclaimer: 'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
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
        disclaimer: 'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
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
        disclaimer: 'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
      },
    ]);
    console.log('Seeded Tax Profiles.');

    // 2. Seed Demo User
    const demoEmail = 'demo@taxpal.dev';
    await User.deleteMany({ email: demoEmail });

    const demoUser = await User.create({
      name: 'Alex Morgan',
      username: 'alexfreelance',
      email: demoEmail,
      password: 'Password123!',
      country: 'United States',
      region: 'California',
      incomeBracket: 'medium',
      currency: 'USD',
      preferences: {
        dateFormat: 'YYYY-MM-DD',
        theme: 'light',
        budgetAlerts: true,
        taxReminders: true,
        monthlySummary: true,
        financialYearStart: 'January',
      },
    });
    console.log('Created Demo User: demo@taxpal.dev / Password123!');

    // Clean old demo data
    await Category.deleteMany({ userId: demoUser._id });
    await Transaction.deleteMany({ userId: demoUser._id });
    await Budget.deleteMany({ userId: demoUser._id });
    await TaxEstimate.deleteMany({ userId: demoUser._id });
    await Alert.deleteMany({ userId: demoUser._id });
    await Report.deleteMany({ userId: demoUser._id });

    // 3. Seed Categories
    const categoriesData = [
      { name: 'Freelance Projects', type: 'income', icon: 'briefcase', color: '#10B981', isDefault: false },
      { name: 'Consulting Retainer', type: 'income', icon: 'file-text', color: '#059669', isDefault: false },
      { name: 'Digital Product Sales', type: 'income', icon: 'dollar-sign', color: '#06B6D4', isDefault: false },
      { name: 'Workshop Speaking', type: 'income', icon: 'trending-up', color: '#6366F1', isDefault: false },
      { name: 'Rent & Workspace', type: 'expense', icon: 'home', color: '#EF4444', isDefault: false },
      { name: 'Software & SaaS', type: 'expense', icon: 'code', color: '#8B5CF6', isDefault: false },
      { name: 'Food & Dining', type: 'expense', icon: 'coffee', color: '#F59E0B', isDefault: false },
      { name: 'Travel & Client Meetings', type: 'expense', icon: 'navigation', color: '#EC4899', isDefault: false },
      { name: 'Marketing & Ads', type: 'expense', icon: 'megaphone', color: '#3B82F6', isDefault: false },
      { name: 'Office Supplies & Gear', type: 'expense', icon: 'package', color: '#14B8A6', isDefault: false },
      { name: 'Utilities & Internet', type: 'expense', icon: 'zap', color: '#F97316', isDefault: false },
    ];

    const categoryDocs = await Category.insertMany(
      categoriesData.map((c) => ({ ...c, userId: demoUser._id }))
    );
    const catMap = {};
    categoryDocs.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // 4. Seed Transactions across multiple months
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth();

    const sampleTransactions = [
      // Current Month
      { type: 'income', description: 'Stripe Payout - UI Design System', categoryId: catMap['Freelance Projects'], amount: 4800, date: new Date(currYear, currMonth, 3), notes: 'Client invoice #1042' },
      { type: 'income', description: 'Monthly Tech Advisory Retainer', categoryId: catMap['Consulting Retainer'], amount: 3200, date: new Date(currYear, currMonth, 7), notes: 'Acme Corp retainer' },
      { type: 'income', description: 'Gumroad Theme Sales', categoryId: catMap['Digital Product Sales'], amount: 1450, date: new Date(currYear, currMonth, 12), notes: '18 template purchases' },
      { type: 'income', description: 'Keynote Speaker Honorarium', categoryId: catMap['Workshop Speaking'], amount: 1500, date: new Date(currYear, currMonth, 18), notes: 'Web Dev Summit 2026' },
      
      { type: 'expense', description: 'WeWork Hot Desk & Private Studio', categoryId: catMap['Rent & Workspace'], amount: 850, date: new Date(currYear, currMonth, 2), notes: 'Monthly membership' },
      { type: 'expense', description: 'Figma Organization + GitHub Copilot + Vercel Pro', categoryId: catMap['Software & SaaS'], amount: 260, date: new Date(currYear, currMonth, 5), notes: 'Design & Dev tools' },
      { type: 'expense', description: 'Fiber Business Internet & Phone line', categoryId: catMap['Utilities & Internet'], amount: 140, date: new Date(currYear, currMonth, 6), notes: 'Fast broadband' },
      { type: 'expense', description: 'Client Dinner & Networking Session', categoryId: catMap['Food & Dining'], amount: 195, date: new Date(currYear, currMonth, 9), notes: 'Discussing Q4 roadmap' },
      { type: 'expense', description: 'Google Ads & LinkedIn Sponsored Post', categoryId: catMap['Marketing & Ads'], amount: 350, date: new Date(currYear, currMonth, 11), notes: 'Lead gen campaign' },
      { type: 'expense', description: 'Flight & Uber for On-Site Workshop', categoryId: catMap['Travel & Client Meetings'], amount: 480, date: new Date(currYear, currMonth, 15), notes: 'Client travel' },
      { type: 'expense', description: 'Ergonomic Desk Accessories & Cables', categoryId: catMap['Office Supplies & Gear'], amount: 180, date: new Date(currYear, currMonth, 16), notes: 'Office upgrade' },

      // Previous Month
      { type: 'income', description: 'Full-Stack Web App Development Phase 2', categoryId: catMap['Freelance Projects'], amount: 5400, date: new Date(currYear, currMonth - 1, 4), notes: 'Milestone 2' },
      { type: 'income', description: 'Monthly Tech Advisory Retainer', categoryId: catMap['Consulting Retainer'], amount: 3200, date: new Date(currYear, currMonth - 1, 8), notes: 'Retainer' },
      { type: 'income', description: 'Digital Asset Templates Gumroad', categoryId: catMap['Digital Product Sales'], amount: 1120, date: new Date(currYear, currMonth - 1, 15), notes: 'Passive sales' },
      { type: 'expense', description: 'WeWork Studio', categoryId: catMap['Rent & Workspace'], amount: 850, date: new Date(currYear, currMonth - 1, 2) },
      { type: 'expense', description: 'Software Subscriptions (Adobe, AWS)', categoryId: catMap['Software & SaaS'], amount: 320, date: new Date(currYear, currMonth - 1, 5) },
      { type: 'expense', description: 'Client Lunches & Coffee', categoryId: catMap['Food & Dining'], amount: 240, date: new Date(currYear, currMonth - 1, 14) },
      { type: 'expense', description: 'Meta Ad Campaigns', categoryId: catMap['Marketing & Ads'], amount: 300, date: new Date(currYear, currMonth - 1, 18) },
      { type: 'expense', description: 'High-speed Internet & Cell', categoryId: catMap['Utilities & Internet'], amount: 140, date: new Date(currYear, currMonth - 1, 20) },

      // Two Months Ago
      { type: 'income', description: 'E-Commerce Platform Rebrand', categoryId: catMap['Freelance Projects'], amount: 6200, date: new Date(currYear, currMonth - 2, 5) },
      { type: 'income', description: 'Monthly Advisory', categoryId: catMap['Consulting Retainer'], amount: 3200, date: new Date(currYear, currMonth - 2, 9) },
      { type: 'expense', description: 'Rent & Workspace', categoryId: catMap['Rent & Workspace'], amount: 850, date: new Date(currYear, currMonth - 2, 3) },
      { type: 'expense', description: 'Development Tools & Cloud Hosting', categoryId: catMap['Software & SaaS'], amount: 290, date: new Date(currYear, currMonth - 2, 7) },
      { type: 'expense', description: 'Meals & Meetings', categoryId: catMap['Food & Dining'], amount: 310, date: new Date(currYear, currMonth - 2, 12) },

      // Three Months Ago
      { type: 'income', description: 'Mobile App Wireframing Sprint', categoryId: catMap['Freelance Projects'], amount: 4500, date: new Date(currYear, currMonth - 3, 6) },
      { type: 'income', description: 'Monthly Advisory', categoryId: catMap['Consulting Retainer'], amount: 3200, date: new Date(currYear, currMonth - 3, 9) },
      { type: 'expense', description: 'WeWork Office Space', categoryId: catMap['Rent & Workspace'], amount: 850, date: new Date(currYear, currMonth - 3, 4) },
      { type: 'expense', description: 'Software & Server Costs', categoryId: catMap['Software & SaaS'], amount: 280, date: new Date(currYear, currMonth - 3, 10) },

      // Four Months Ago
      { type: 'income', description: 'SaaS Dashboard Redesign', categoryId: catMap['Freelance Projects'], amount: 5000, date: new Date(currYear, currMonth - 4, 10) },
      { type: 'income', description: 'Monthly Advisory', categoryId: catMap['Consulting Retainer'], amount: 3200, date: new Date(currYear, currMonth - 4, 12) },
      { type: 'expense', description: 'Rent & Workspace', categoryId: catMap['Rent & Workspace'], amount: 850, date: new Date(currYear, currMonth - 4, 5) },
      { type: 'expense', description: 'Software SaaS', categoryId: catMap['Software & SaaS'], amount: 250, date: new Date(currYear, currMonth - 4, 8) },

      // Five Months Ago
      { type: 'income', description: 'Freelance API Integration', categoryId: catMap['Freelance Projects'], amount: 4200, date: new Date(currYear, currMonth - 5, 14) },
      { type: 'income', description: 'Monthly Advisory', categoryId: catMap['Consulting Retainer'], amount: 3200, date: new Date(currYear, currMonth - 5, 16) },
      { type: 'expense', description: 'Rent & Workspace', categoryId: catMap['Rent & Workspace'], amount: 850, date: new Date(currYear, currMonth - 5, 6) },
      { type: 'expense', description: 'Software Subscriptions', categoryId: catMap['Software & SaaS'], amount: 230, date: new Date(currYear, currMonth - 5, 11) },
    ];

    await Transaction.insertMany(
      sampleTransactions.map((t) => ({ ...t, userId: demoUser._id }))
    );
    console.log(`Seeded ${sampleTransactions.length} demo transactions.`);

    // 5. Seed Monthly Budgets for current month
    const budgetData = [
      { categoryId: catMap['Rent & Workspace'], limit: 1000, month: currMonth + 1, year: currYear, description: 'Monthly studio space' },
      { categoryId: catMap['Software & SaaS'], limit: 400, month: currMonth + 1, year: currYear, description: 'All cloud & design software' },
      { categoryId: catMap['Food & Dining'], limit: 300, month: currMonth + 1, year: currYear, description: 'Client entertainment & lunches' },
      { categoryId: catMap['Marketing & Ads'], limit: 500, month: currMonth + 1, year: currYear, description: 'Paid client acquisition' },
      { categoryId: catMap['Travel & Client Meetings'], limit: 600, month: currMonth + 1, year: currYear, description: 'Transit, flights, rides' },
      { categoryId: catMap['Utilities & Internet'], limit: 200, month: currMonth + 1, year: currYear, description: 'Internet and utility bills' },
    ];

    await Budget.insertMany(
      budgetData.map((b) => ({ ...b, userId: demoUser._id }))
    );
    console.log('Seeded demo budgets.');

    // 6. Seed Tax Estimate
    const usProfile = createdProfiles.find((p) => p.country === 'United States');
    if (usProfile) {
      const calcResult = calculateTaxEstimate({
        totalIncome: 10950,
        otherIncome: 0,
        businessExpenses: 2465,
        claimedDeductions: 4000,
        taxProfile: usProfile,
        quarter: 'Q2',
      });

      await TaxEstimate.create({
        userId: demoUser._id,
        country: 'United States',
        region: 'Federal',
        financialYear: '2024',
        quarter: 'Q2',
        totalIncome: calcResult.grossIncome,
        businessExpenses: calcResult.businessExpenses,
        deductions: calcResult.totalDeductions,
        taxableIncome: calcResult.taxableIncome,
        estimatedTax: calcResult.annualEstimatedTax,
        quarterlyEstimatedTax: calcResult.quarterlyEstimatedTax,
        effectiveTaxRate: calcResult.effectiveTaxRate,
        taxProfileId: usProfile._id,
        calculationDetails: calcResult,
      });
      console.log('Seeded demo tax estimate.');
    }

    // 7. Seed Alerts
    await Alert.insertMany([
      {
        userId: demoUser._id,
        title: 'Q2 Estimated Tax Due Soon',
        message: 'Your Q2 federal estimated tax deadline is approaching. Ensure your quarterly voucher or EFTPS payment is submitted.',
        type: 'tax_deadline',
        dueDate: new Date(currYear, 5, 15),
        status: 'upcoming',
        actionUrl: '/tax-calendar',
      },
      {
        userId: demoUser._id,
        title: 'Budget Alert: Marketing & Ads at 70%',
        message: 'You have spent $350 of your $500 monthly Marketing budget.',
        type: 'budget_warning',
        status: 'upcoming',
        actionUrl: '/budgets',
      },
      {
        userId: demoUser._id,
        title: 'Monthly Financial Summary Ready',
        message: 'Your previous month financial report has been compiled and is ready for export.',
        type: 'monthly_summary',
        status: 'completed',
        isRead: true,
        actionUrl: '/reports',
      },
    ]);
    console.log('Seeded demo alerts.');

    console.log('\n==========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('Email:    demo@taxpal.dev');
    console.log('Password: Password123!');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

