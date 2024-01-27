import express, { Request, RequestHandler, Response } from 'express';
import {
  normalizeCreateData,
  validateCreateCustomerTransaction,
} from '../../../middleware/customerTransactionValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createTransaction } from './createTransaction';

const router = express.Router();
router.post(
  '/',
  authenticate,
  normalizeCreateData,
  validateCreateCustomerTransaction,
  createTransaction,
);

export default router;
