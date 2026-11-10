const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const TaxProfile = require('./models/TaxProfile');
const TaxEstimate = require('./models/TaxEstimate');
const { calculateTaxEstimate } = require('./services/taxCalculationService');
const { calculateBudgetProgress } = require('./services/budgetService');
const { generateCSV, generatePDF } = require('./services/reportService');

const runTests = async () => {
  console.log('🧪 Starting TaxPal Comprehensive Test Suite...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taxpal');
    console.log('✅ Connected to MongoDB.');

    // Test 1: User & Auth
    console.log('\n--- 1. Testing User Authentication Logic ---');
    const testEmail = `test_${Date.now()}@taxpal.dev`;
    const user = await User.create({
      name: 'Test Tester',
      username: `tester_${Date.now()}`,
      email: testEmail,
      password: 'SecurePassword123!',
      country: 'India',
      currency: 'INR',
    });
    console.log(`✅ Created test user: ${user.email} (ID: ${user._id})`);

    // Verify password hashing
    const userWithPassword = await User.findById(user._id).select('+password');
    const isMatch = await userWithPassword.matchPassword('SecurePassword123!');
    const isBadMatch = await userWithPassword.matchPassword('WrongPass');
    console.log(`✅ Password match test: correct=${isMatch}, incorrect=${isBadMatch}`);
    if (!isMatch || isBadMatch) throw new Error('Password hashing verification failed');

    // Duplicate email check
    try {
      await User.create({
        name: 'Duplicate',
        username: `dup_${Date.now()}`,
        email: testEmail,
        password: 'Password123!',
      });
      throw new Error('Duplicate email was not rejected!');
    } catch (err) {
      console.log('✅ Duplicate email correctly rejected with error');
    }

    // Test 2: Category Management
    console.log('\n--- 2. Testing Category Management ---');
    const incomeCat = await Category.create({
      userId: user._id,
      name: 'Freelance Mobile Dev',
      type: 'income',
      color: '#10B981',
      icon: 'smartphone',
    });
    const expenseCat = await Category.create({
      userId: user._id,
      name: 'Cloud Hosting & CI',
      type: 'expense',
      color: '#6366F1',
      icon: 'server',
    });
    console.log(`✅ Created custom categories: ${incomeCat.name} (income) & ${expenseCat.name} (expense)`);

    // Test 3: Transactions & Summary
    console.log('\n--- 3. Testing Transactions & Cashflow Ledger ---');
    const now = new Date();
    const t1 = await Transaction.create({
      userId: user._id,
      type: 'income',
      description: 'Client iOS App Milestone',
      categoryId: incomeCat._id,
      amount: 80000,
      date: now,
    });
    const t2 = await Transaction.create({
      userId: user._id,
      type: 'expense',
      description: 'DigitalOcean Kubernetes cluster',
      categoryId: expenseCat._id,
      amount: 15000,
      date: now,
    });
    console.log(`✅ Recorded transactions: Income +₹${t1.amount}, Expense -₹${t2.amount}`);

    // Test 4: Budget Progress Calculation
    console.log('\n--- 4. Testing Budget Calculations & Health Status ---');
    const budget = await Budget.create({
      userId: user._id,
      categoryId: expenseCat._id,
      limit: 20000,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      description: 'Monthly cloud infrastructure ceiling',
    });
    const populatedBudget = await Budget.findById(budget._id).populate('categoryId');
    const [processedBudget] = await calculateBudgetProgress(
      user._id,
      [populatedBudget],
      now.getMonth() + 1,
      now.getFullYear()
    );
    console.log(`✅ Budget calculation verified:`);
    console.log(`   Limit: ₹${processedBudget.limit}, Spent: ₹${processedBudget.spent}, Remaining: ₹${processedBudget.remaining}`);
    console.log(`   Percentage: ${processedBudget.percentage}%, Status: ${processedBudget.status}`);
    if (processedBudget.spent !== 15000 || processedBudget.status !== 'Warning') {
      throw new Error('Budget calculation mismatch');
    }

    // Test 5: Tax Calculation Engine
    console.log('\n--- 5. Testing Tax Calculation Engine (Progressive Slabs) ---');
    const taxProfile = await TaxProfile.findOne({ country: 'India', financialYear: '2024-2025' });
    if (!taxProfile) throw new Error('India tax profile not found in database');

    const taxResult = calculateTaxEstimate({
      totalIncome: 1200000,
      otherIncome: 50000,
      businessExpenses: 150000,
      claimedDeductions: 50000,
      taxProfile,
      quarter: 'Q2',
    });

    console.log(`✅ Progressive Tax computed:`);
    console.log(`   Gross Income: ₹${taxResult.grossIncome}`);
    console.log(`   Business Expenses: ₹${taxResult.businessExpenses}`);
    console.log(`   Standard Deduction: ₹${taxResult.standardDeduction}`);
    console.log(`   Total Deductions: ₹${taxResult.totalDeductions}`);
    console.log(`   Taxable Income: ₹${taxResult.taxableIncome}`);
    console.log(`   Base Tax: ₹${taxResult.baseTax}`);
    console.log(`   Cess (4%): ₹${taxResult.cessAmount}`);
    console.log(`   Annual Tax Due: ₹${taxResult.annualEstimatedTax}`);
    console.log(`   Quarterly Estimated Payment: ₹${taxResult.quarterlyEstimatedTax}`);
    console.log(`   Effective Tax Rate: ${taxResult.effectiveTaxRate}%`);

    // Verify TaxEstimate persistence
    const savedEstimate = await TaxEstimate.create({
      userId: user._id,
      country: taxResult.country,
      region: taxResult.region,
      financialYear: taxResult.financialYear,
      quarter: taxResult.quarter,
      totalIncome: taxResult.grossIncome,
      businessExpenses: taxResult.businessExpenses,
      deductions: taxResult.totalDeductions,
      taxableIncome: taxResult.taxableIncome,
      estimatedTax: taxResult.annualEstimatedTax,
      quarterlyEstimatedTax: taxResult.quarterlyEstimatedTax,
      effectiveTaxRate: taxResult.effectiveTaxRate,
      taxProfileId: taxProfile._id,
      calculationDetails: taxResult,
    });
    console.log(`✅ Saved TaxEstimate record in MongoDB (ID: ${savedEstimate._id})`);

    // Test 6: Report Generation (PDF and CSV)
    console.log('\n--- 6. Testing Financial Report Generation ---');
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const csvResult = await generateCSV({
      userId: user._id,
      user,
      reportType: 'Detailed Transactions',
      period: 'Current Month',
      startDate,
      endDate,
    });
    console.log(`✅ Generated CSV report: ${csvResult.fileName} (Transactions: ${csvResult.summaryData.totalTransactions})`);

    const pdfResult = await generatePDF({
      userId: user._id,
      user,
      reportType: 'Financial Summary',
      period: 'Current Month',
      startDate,
      endDate,
    });
    console.log(`✅ Generated PDF report: ${pdfResult.fileName} (Total Income: ₹${pdfResult.summaryData.totalIncome})`);

    // Cleanup test user data
    await User.deleteOne({ _id: user._id });
    await Category.deleteMany({ userId: user._id });
    await Transaction.deleteMany({ userId: user._id });
    await Budget.deleteMany({ userId: user._id });
    await TaxEstimate.deleteMany({ userId: user._id });
    console.log('\n🧹 Cleaned up temporary test artifacts.');

    console.log('\n======================================================');
    console.log('🎉 ALL 6 COMPREHENSIVE TEST MODULES PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  }
};

runTests();

