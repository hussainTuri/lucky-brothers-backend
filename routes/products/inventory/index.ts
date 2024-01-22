import express, { Request, RequestHandler, Response } from 'express';
import {
  normalizeCreateData,
  validateCreateProductInventory,
} from '../../../middleware/productInventoryValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createInventory } from './createInventory';

const router = express.Router();
router.post(
  '/',
  authenticate,
  normalizeCreateData,
  validateCreateProductInventory,
  createInventory,
);

export default router;
