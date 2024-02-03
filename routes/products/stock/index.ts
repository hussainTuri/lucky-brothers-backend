import express from 'express';
import {
  normalizeCreateData,
  validateCreateProductStock,
} from '../../../middleware/productStockValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createStock } from './createStock';

const router = express.Router();
router.post('/', authenticate, normalizeCreateData, validateCreateProductStock, createStock);

export default router;
