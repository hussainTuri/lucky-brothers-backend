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
const router = express.Router();

router.get('/', getCustomers);
router.post('/', normalizeCreateData, validateCreateCustomer, createCustomer);
router.get('/:customerId', getCustomer);
router.post('/search', cleanSearchInput, searchCustomers);
router.put('/:customerId', normalizeUpdateData, validateUpdateCustomer, updateCustomer);

export default router;
