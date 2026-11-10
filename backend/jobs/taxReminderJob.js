const cron = require('node-cron');
const User = require('../models/User');
const { checkUserTaxAlerts } = require('../services/notificationService');

const initTaxReminderJob = () => {
  // Run once daily at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron Job] Running daily tax deadline & alert check...');
      const users = await User.find({ 'preferences.taxReminders': true });
      for (const user of users) {
        await checkUserTaxAlerts(user);
      }
      console.log(`[Cron Job] Tax alerts updated for ${users.length} users.`);
    } catch (err) {
      console.error('[Cron Job Error]:', err.message);
    }
  });
};

module.exports = initTaxReminderJob;

