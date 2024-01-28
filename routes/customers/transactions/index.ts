import express, { Request, RequestHandler, Response } from 'express';
import {
  normalizeCreateData,
  validateCreateCustomerTransaction,
  validateDeleteCustomerTransaction,
} from '../../../middleware/customerTransactionValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createTransaction } from './createTransaction';
import { deleteTransaction } from './deleteTransaction';

const router = express.Router();
router.post(
  '/:customerId/transactions/',
  authenticate,
  normalizeCreateData,
  validateCreateCustomerTransaction,
  createTransaction,
);

router.delete(
  '/:customerId/transactions/:transactionId/',
  authenticate,
  validateDeleteCustomerTransaction,
  deleteTransaction,
);
export default router;
