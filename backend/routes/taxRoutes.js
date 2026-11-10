const express = require('express');
const router = express.Router();
const {
  calculateTax,
  getTaxEstimates,
  getTaxEstimateById,
  getTaxProfiles,
  getTaxCalendar,
} = require('../controllers/taxController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/calculate', calculateTax);
router.get('/estimates', getTaxEstimates);
router.get('/estimates/:id', getTaxEstimateById);
router.get('/profiles', getTaxProfiles);
router.get('/calendar', getTaxCalendar);

module.exports = router;

