// Notification Service - tax deadlines aur alerts manage karo

const Alert = require('../models/Alert');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Country ke hisaab se quarterly tax deadlines return karo
const getJurisdictionTaxDeadlines = (country = 'India', year = new Date().getFullYear()) => {
  // US ke tax deadlines
  if (country === 'United States') {
    return [
      { quarter: 'Q1', title: 'Q1 Estimated Tax Due', dueDate: new Date(year, 3, 15), description: 'US Federal estimated tax for Jan 1 - Mar 31' },
      { quarter: 'Q2', title: 'Q2 Estimated Tax Due', dueDate: new Date(year, 5, 15), description: 'US Federal estimated tax for Apr 1 - May 31' },
      { quarter: 'Q3', title: 'Q3 Estimated Tax Due', dueDate: new Date(year, 8, 15), description: 'US Federal estimated tax for Jun 1 - Aug 31' },
      { quarter: 'Q4', title: 'Q4 Estimated Tax Due', dueDate: new Date(year + 1, 0, 15), description: 'US Federal estimated tax for Sep 1 - Dec 31' },
    ];
  }

  // India ke advance tax deadlines (freelancers ke liye)
  return [
    { quarter: 'Q1', title: 'Advance Tax 1st Installment (15%)', dueDate: new Date(year, 5, 15), description: '15% of estimated advance tax due' },
    { quarter: 'Q2', title: 'Advance Tax 2nd Installment (45%)', dueDate: new Date(year, 8, 15), description: '45% of estimated advance tax due' },
    { quarter: 'Q3', title: 'Advance Tax 3rd Installment (75%)', dueDate: new Date(year, 11, 15), description: '75% of estimated advance tax due' },
    { quarter: 'Q4', title: 'Advance Tax 4th Installment (100%)', dueDate: new Date(year + 1, 2, 15), description: '100% of estimated advance tax due' },
  ];
};

// User ke liye tax alerts check karo aur create/update karo
const checkUserTaxAlerts = async (user) => {
  const deadlines = getJurisdictionTaxDeadlines(user.country || 'India');
  const now = new Date();

  for (const item of deadlines) {
    // Kitne din baaki hain deadline mein
    const diffDays = Math.ceil((item.dueDate - now) / (1000 * 60 * 60 * 24));

    // Status decide karo
    let status = 'upcoming';
    if (diffDays < 0) {
      status = 'overdue';
    } else if (diffDays <= 7) {
      status = 'due';
    }

    // Sirf 30 din ke andar ki deadlines ke liye alert banao
    if (diffDays <= 30 && diffDays >= -30) {
      // Check karo ki pehle se alert hai ya nahi
      const existing = await Alert.findOne({
        userId: user._id,
        type: 'tax_deadline',
        title: item.title,
      });

      if (!existing) {
        // Naya alert create karo
        const daysMessage = diffDays >= 0
          ? `${diffDays} days remaining`
          : `${Math.abs(diffDays)} days overdue`;

        await Alert.create({
          userId: user._id,
          title: item.title,
          message: `${item.description}. Due date: ${item.dueDate.toDateString()} (${daysMessage}).`,
          type: 'tax_deadline',
          dueDate: item.dueDate,
          status,
          actionUrl: '/tax-calendar',
        });
      } else if (existing.status !== status && existing.status !== 'completed') {
        // Status update karo agar change hua hai
        existing.status = status;
        await existing.save();
      }
    }
  }
};

module.exports = {
  getJurisdictionTaxDeadlines,
  checkUserTaxAlerts,
};
