import express from 'express';
import { getMonthlyProfits } from './getMonthlyProfits';
import { getPendingMonthlyProfits } from './getPendingMonthlyProfits';
import { authenticate } from '../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateMonthlyProfit,
} from '../../middleware/monthlyProfitValidators';
import { createMonthlyProfit } from './createMonthlyProfit';

const router = express.Router();

router.get('/monthly', authenticate, getMonthlyProfits);
router.post(
  '/monthly',
  authenticate,
  normalizeCreateData,
  validateCreateMonthlyProfit,
  createMonthlyProfit,
);
router.get('/monthly/pending', authenticate, getPendingMonthlyProfits);

export default router;
