import express from 'express';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateProductStock,
  validateUpdateProductStock,
} from '../../../middleware/productStockValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createStock } from './createStock';
import { updateStock } from './updateStock';

const router = express.Router();
router.post(
  '/:stockId/update',
  authenticate,
  normalizeUpdateData,
  validateUpdateProductStock,
  updateStock,
);
router.post('/', authenticate, normalizeCreateData, validateCreateProductStock, createStock);

export default router;
