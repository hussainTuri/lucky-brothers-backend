import express from 'express';
import { getTransportCustomers } from './getCustomers';
import { searchCustomers } from './searchCustomers';
import { authenticate } from '../../../middleware/authenticate';
import {
  cleanTransportCustomerSearchInput,
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateTransportCustomer,
  validateUpdateTransportCustomer,
} from '../../../middleware/transport/customerValidators';
import { getCustomer } from './getCustomer';
import reservationRoutes from './reservations';
import { updateTransportCustomer } from './updateCustomer';
import { createTransportCustomer } from './createCustomer';

const router = express.Router();

router.get('/', authenticate, getTransportCustomers);
router.post('/search', authenticate, cleanTransportCustomerSearchInput, searchCustomers);
router.get('/:customerId(\\d+)', authenticate, getCustomer);
router.use('/:customerId(\\d+)/reservations', reservationRoutes);
router.post(
  '/',
  authenticate,
  normalizeCreateData,
  validateCreateTransportCustomer,
  createTransportCustomer,
);
router.put(
  '/:customerId(\\d+)/update',
  authenticate,
  normalizeUpdateData,
  validateUpdateTransportCustomer,
  updateTransportCustomer,
);

export default router;
