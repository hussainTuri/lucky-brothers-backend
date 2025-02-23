import express from 'express';
import { getTransportCustomers } from './getCustomers';
import { searchCustomers } from './searchCustomers';
import { authenticate } from '../../../middleware/authenticate';
import { cleanTransportCustomerSearchInput } from '../../../middleware/transport/customerValidators';
import { getCustomer } from './getCustomer';
import reservationRoutes from './reservations';

const router = express.Router();

router.get('/', authenticate, getTransportCustomers);
router.post('/search', authenticate, cleanTransportCustomerSearchInput, searchCustomers);
router.get('/:customerId(\\d+)', authenticate, getCustomer);
router.use('/:customerId(\\d+)/reservations', reservationRoutes);


export default router;
