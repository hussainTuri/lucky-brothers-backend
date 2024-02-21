import express from 'express';
import { getMonthlyReports } from './getMonthlyReports';
import { getPendingMonthlyReports } from './getPendingMonthlyReports';
import { authenticate } from '../../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateMonthlyReport,
} from '../../../middleware/monthlyReportValidators';
import { createMonthlyReport } from './createMonthlyReport';

const router = express.Router();

router.get('/', authenticate, getMonthlyReports);
router.post(
  '/',
  authenticate,
  normalizeCreateData,
  validateCreateMonthlyReport,
  createMonthlyReport,
);
router.get('/pending', authenticate, getPendingMonthlyReports);

export default router;
