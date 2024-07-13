import express from 'express';
import {
  normalizeCreateData,
  validateCreateCustomerTransaction,
  validateDeleteCustomerTransaction,
} from '../../../middleware/customerTransactionValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createTransaction } from './createTransaction';
import { deleteTransaction } from './deleteTransaction';
import { validateQueryParams } from '../../../middleware/invoiceValidators';
import { getTransactions } from './getTransactions';

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

router.get('/transactions', authenticate, validateQueryParams, getTransactions);

export default router;
