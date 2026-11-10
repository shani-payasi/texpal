// Report Service - PDF aur CSV reports generate karo

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const TaxEstimate = require('../models/TaxEstimate');
const { calculateBudgetProgress } = require('./budgetService');

// Reports folder banao agar nahi hai
const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Period ke hisaab se start aur end date nikalo
const getDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (period) {
    case 'Current Month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'Previous Month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case 'Current Quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1);
      endDate = new Date(now.getFullYear(), qMonth + 3, 0, 23, 59, 59, 999);
      break;
    }

    case 'Previous Quarter': {
      const prevQMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
      startDate = new Date(now.getFullYear(), prevQMonth, 1);
      endDate = new Date(now.getFullYear(), prevQMonth + 3, 0, 23, 59, 59, 999);
      break;
    }

    case 'Current Year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    case 'Custom Date Range':
      startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), 0, 1);
      endDate = customEnd ? new Date(customEnd) : now;
      break;

    default:
      // Default: current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// CSV report generate karo
const generateCSV = async ({ userId, user, reportType, period, startDate, endDate }) => {
  // Query banao - report type ke hisaab se filter karo
  const query = {
    userId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (reportType === 'Income Statement') {
    query.type = 'income';
  } else if (reportType === 'Expense Statement') {
    query.type = 'expense';
  }

  // Transactions fetch karo
  const transactions = await Transaction.find(query)
    .populate('categoryId', 'name')
    .sort({ date: -1 });

  // CSV ke columns define karo
  const fields = [
    { label: 'Date', value: (row) => new Date(row.date).toISOString().split('T')[0] },
    { label: 'Type', value: 'type' },
    { label: 'Category', value: (row) => row.categoryId?.name || 'Uncategorized' },
    { label: 'Description', value: 'description' },
    { label: 'Amount', value: 'amount' },
    { label: 'Notes', value: (row) => row.notes || '' },
  ];

  // CSV generate karo aur file save karo
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(transactions);

  const fileName = `TaxPal_${reportType.replace(/\s+/g, '_')}_${Date.now()}.csv`;
  const filePath = path.join(reportsDir, fileName);
  fs.writeFileSync(filePath, csv);

  // Totals calculate karo
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return {
    fileName,
    filePath,
    summaryData: {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
    },
  };
};

// PDF report generate karo (PDFKit se)
const generatePDF = async ({ userId, user, reportType, period, startDate, endDate }) => {
  const fileName = `TaxPal_${reportType.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  // Transactions fetch karo
  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  })
    .populate('categoryId', 'name')
    .sort({ date: -1 });

  // Income aur expense totals nikalo
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Category wise breakdown banao
  const categoryMap = {};
  transactions.forEach((t) => {
    const categoryName = t.categoryId?.name || 'Uncategorized';
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categoryMap[categoryName].income += t.amount;
    } else {
      categoryMap[categoryName].expense += t.amount;
    }
  });

  // Latest tax estimate fetch karo (agar hai toh)
  const latestTax = await TaxEstimate.findOne({ userId }).sort({ createdAt: -1 });

  // PDF generate karo using Promise
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Colors aur currency set karo
    const primaryColor = '#4338CA';
    const textColor = '#1F2937';
    const mutedColor = '#6B7280';
    const currency = user.currency || 'USD';

    // === HEADER SECTION ===
    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('TAXPAL FINANCIAL STATEMENT', 40, 45);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(mutedColor)
      .text('Personal Finance & Tax Management for Independent Professionals', 40, 72);

    doc.moveTo(40, 88).lineTo(555, 88).strokeColor('#E5E7EB').stroke();

    // === USER INFO SECTION ===
    let y = 100;
    doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text('Prepared For:', 40, y);
    doc.font('Helvetica').text(`${user.name} (${user.email})`, 120, y);

    doc.font('Helvetica-Bold').text('Report Type:', 340, y);
    doc.font('Helvetica').text(reportType, 420, y);

    y += 18;
    doc.font('Helvetica-Bold').text('Period:', 40, y);
    doc.font('Helvetica').text(
      `${period} (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`,
      120,
      y
    );

    doc.font('Helvetica-Bold').text('Generated On:', 340, y);
    doc.font('Helvetica').text(new Date().toLocaleDateString(), 420, y);

    // === FINANCIAL SUMMARY BOXES ===
    y += 28;

    // Income box (green)
    doc.rect(40, y, 160, 60).fillAndStroke('#F0FDF4', '#86EFAC');
    doc.fillColor('#15803D').fontSize(10).font('Helvetica-Bold').text('TOTAL INCOME', 50, y + 10);
    doc.fontSize(16).text(
      `${currency} ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      50,
      y + 28
    );

    // Expense box (red)
    doc.rect(210, y, 160, 60).fillAndStroke('#FEF2F2', '#FCA5A5');
    doc.fillColor('#B91C1C').fontSize(10).font('Helvetica-Bold').text('TOTAL EXPENSES', 220, y + 10);
    doc.fontSize(16).text(
      `${currency} ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      220,
      y + 28
    );

    // Net savings box (blue)
    doc.rect(380, y, 175, 60).fillAndStroke('#EEF2FF', '#A5B4FC');
    doc.fillColor('#4338CA').fontSize(10).font('Helvetica-Bold').text('NET SAVINGS', 390, y + 10);
    doc.fontSize(16).text(
      `${currency} ${netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      390,
      y + 28
    );

    y += 80;

    // === CATEGORY BREAKDOWN TABLE ===
    doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('Category Breakdown', 40, y);
    y += 18;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#E5E7EB').stroke();
    y += 8;

    // Table header
    doc.fillColor(mutedColor).fontSize(9).font('Helvetica-Bold');
    doc.text('CATEGORY', 45, y);
    doc.text('INCOME', 240, y);
    doc.text('EXPENSE', 360, y);
    doc.text('NET', 470, y);
    y += 14;

    // Table rows
    const categories = Object.keys(categoryMap);
    if (categories.length === 0) {
      doc.font('Helvetica').fillColor(mutedColor).text('No categorized transactions recorded in this period.', 45, y);
      y += 16;
    } else {
      categories.forEach((cat) => {
        // Naya page agar jagah nahi hai
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        const row = categoryMap[cat];
        const net = row.income - row.expense;

        doc.font('Helvetica').fontSize(9).fillColor(textColor);
        doc.text(cat.substring(0, 25), 45, y);
        doc.text(`${currency} ${row.income.toFixed(2)}`, 240, y);
        doc.text(`${currency} ${row.expense.toFixed(2)}`, 360, y);
        doc.fillColor(net >= 0 ? '#15803D' : '#B91C1C').text(`${currency} ${net.toFixed(2)}`, 470, y);
        y += 15;
      });
    }

    y += 15;

    // === TAX ESTIMATE SECTION (agar available hai) ===
    if (latestTax) {
      if (y > 680) {
        doc.addPage();
        y = 50;
      }
      doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('Latest Tax Estimate Reference', 40, y);
      y += 16;
      doc.font('Helvetica').fontSize(9).fillColor(textColor);
      doc.text(
        `Financial Year: ${latestTax.financialYear} | Quarter: ${latestTax.quarter} | Estimated Tax Due: ${currency} ${latestTax.estimatedTax.toLocaleString()}`,
        40,
        y
      );
      y += 18;
    }

    // === TRANSACTION LOG TABLE ===
    if (y > 640) {
      doc.addPage();
      y = 50;
    }
    doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('Transaction Log (Recent)', 40, y);
    y += 18;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#E5E7EB').stroke();
    y += 8;

    // Transaction table header
    doc.fillColor(mutedColor).fontSize(9).font('Helvetica-Bold');
    doc.text('DATE', 45, y);
    doc.text('DESCRIPTION', 115, y);
    doc.text('CATEGORY', 260, y);
    doc.text('TYPE', 390, y);
    doc.text('AMOUNT', 470, y);
    y += 14;

    // Sirf pehle 25 transactions dikhao
    const displayTransactions = transactions.slice(0, 25);
    displayTransactions.forEach((tx) => {
      if (y > 740) {
        doc.addPage();
        y = 50;
      }

      const txDate = new Date(tx.date).toISOString().split('T')[0];
      const txDesc = (tx.description || '').substring(0, 26);
      const txCategory = (tx.categoryId?.name || 'Uncategorized').substring(0, 20);
      const txColor = tx.type === 'income' ? '#15803D' : '#B91C1C';

      doc.font('Helvetica').fontSize(8.5).fillColor(textColor);
      doc.text(txDate, 45, y);
      doc.text(txDesc, 115, y);
      doc.text(txCategory, 260, y);
      doc.fillColor(txColor).text(tx.type.toUpperCase(), 390, y);
      doc.fillColor(txColor).text(`${currency} ${tx.amount.toFixed(2)}`, 470, y);
      y += 15;
    });

    // === DISCLAIMER FOOTER ===
    doc
      .fontSize(8)
      .fillColor(mutedColor)
      .text(
        'Disclaimer: TaxPal provides estimated calculations and financial summaries for informational purposes only. Consult a certified financial planner or tax advisor for professional filings.',
        40,
        770,
        { align: 'center', width: 515 }
      );

    doc.end();

    // PDF write hone ka wait karo
    writeStream.on('finish', () => {
      resolve({
        fileName,
        filePath,
        summaryData: {
          totalIncome,
          totalExpense,
          netSavings,
          transactionCount: transactions.length,
          generatedAt: new Date(),
        },
      });
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = {
  getDateRange,
  generateCSV,
  generatePDF,
};
