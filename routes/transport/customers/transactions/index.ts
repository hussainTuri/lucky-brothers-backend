import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import { getTransactions } from './getTransactions';
import {
  validateDeleteTransportCustomerTransaction,
} from '../../../../middleware/transport/customerTransactionValidators';
import { deleteTransaction } from './deleteTransaction';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, getTransactions);
router.delete(
  '/:transactionId(\\d+)/delete',
  authenticate,
  validateDeleteTransportCustomerTransaction,
  deleteTransaction,
);
export default router;
