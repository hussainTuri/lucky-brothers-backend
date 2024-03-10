import express from 'express';
import { getCashesOut } from './getCash';
import { authenticate } from '../../middleware/authenticate';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateCashOut,
  validateUpdateCashOut,
} from '../../middleware/cashOutValidators';
import { createCashOut } from './createCash';
import { updateCashOut } from './updateCash';

const router = express.Router();

router.get('/', authenticate, getCashesOut);
router.post('/', authenticate, normalizeCreateData, validateCreateCashOut, createCashOut);
router.post(
  '/:cashId/update',
  authenticate,
  normalizeUpdateData,
  validateUpdateCashOut,
  updateCashOut,
);
export default router;
