const express = require('express');
const router = express.Router();
const {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAlerts);
router.put('/read-all', markAllAlertsAsRead);
router.put('/:id/read', markAlertAsRead);
router.delete('/:id', deleteAlert);

module.exports = router;

