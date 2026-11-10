const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.get('/summary', getBudgetSummary);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;

