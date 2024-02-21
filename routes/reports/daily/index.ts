import express from 'express';
import { getDailyReports } from './getDailyReports';
import { getPendingDailyReports } from './getPendingDailyReports';
import { authenticate } from '../../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateDailyReport,
} from '../../../middleware/dailyReportValidators';
import { createDailyReport } from './createDailyReport';

const router = express.Router();

router.get('/', authenticate, getDailyReports);
router.post('/', authenticate, normalizeCreateData, validateCreateDailyReport, createDailyReport);
router.get('/pending', authenticate, getPendingDailyReports);

export default router;
