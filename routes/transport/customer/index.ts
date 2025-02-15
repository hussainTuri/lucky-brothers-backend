import express from 'express';
import { getTransportCustomers } from './getCustomers';
import { searchCustomers } from './searchCustomers';
import { authenticate } from '../../../middleware/authenticate';
import { cleanTransportCustomerSearchInput } from '../../../middleware/transport/customerValidators';


const router = express.Router();

router.get('/', authenticate, getTransportCustomers);
router.post('/search', authenticate, cleanTransportCustomerSearchInput, searchCustomers);


export default router;
