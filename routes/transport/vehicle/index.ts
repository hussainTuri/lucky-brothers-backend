import express from 'express';
import { authenticate } from '../../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateCash,
} from '../../../middleware/cashValidators';
import { createVehicle } from './createVehicle';
import { getVehicles } from './getVehicles';

const router = express.Router();

router.get('/', authenticate, getVehicles);
router.post('/', authenticate, normalizeCreateData, validateCreateCash, createVehicle);
export default router;
