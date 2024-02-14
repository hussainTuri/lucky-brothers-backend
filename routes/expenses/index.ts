import express from 'express';
import { getExpenses } from './getExpenses';
import { authenticate } from '../../middleware/authenticate';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateExpense,
  validateUpdateExpense,
} from '../../middleware/expenseValidators';
import { createExpense } from './createExpense';
import { updateExpense } from './updateExpense';

const router = express.Router();

router.get('/', authenticate, getExpenses);
router.post('/', authenticate, normalizeCreateData, validateCreateExpense, createExpense);
router.post(
  '/:expenseId/update',
  authenticate,
  normalizeUpdateData,
  validateUpdateExpense,
  updateExpense,
);
export default router;
