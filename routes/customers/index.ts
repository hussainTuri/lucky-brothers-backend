import express, { Request, RequestHandler, Response } from 'express';
import { getCustomers } from './getCustomers';
import { getCustomer } from './getCustomer';
import { searchCustomers } from './searchCustomers';
import { updateCustomer } from './updateCustomer';
import {
  cleanSearchInput,
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateCustomer,
  validateUpdateCustomer,
} from '../../middleware/customerValidators';
import { createCustomer } from './createCustomer';
import { authenticate } from '../../middleware/authenticate';
import transactionRoutes from './transactions';

const router = express.Router();

router.get('/', authenticate, getCustomers);
router.post('/', authenticate, normalizeCreateData, validateCreateCustomer, createCustomer);

// Transactions
router.use('/', transactionRoutes);
router.get('/:customerId', authenticate, getCustomer);
router.post('/search', authenticate, cleanSearchInput, searchCustomers);

router.put(
  '/:customerId',
  authenticate,
  normalizeUpdateData,
  validateUpdateCustomer,
  updateCustomer,
);

export default router;
