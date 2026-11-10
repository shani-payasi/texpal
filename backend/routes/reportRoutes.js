const express = require('express');
const router = express.Router();
const {
  generateReport,
  getReports,
  getReportById,
  downloadReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getReports)
  .post(generateReport);

router.get('/:id', getReportById);
router.get('/:id/download', downloadReport);

module.exports = router;

