import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import { getTransactions } from './getTransactions';
import {
  validateCreateVehicleTransaction,
  validateUpdateVehicleTransaction,
  validateDeleteVehicleTransaction,
} from '../../../../middleware/transport/vehicleTransactionValidators';
import { createVehicleTransaction } from './createTransaction';
import { updateVehicleTransaction } from './updateTransaction';
import { deleteTransaction } from './deleteTransaction';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, getTransactions);
router.post('/', authenticate, validateCreateVehicleTransaction, createVehicleTransaction);
router.put(
  '/:transactionId(\\d+)/update',
  authenticate,
  validateUpdateVehicleTransaction,
  updateVehicleTransaction,
);
router.delete(
  '/:transactionId(\\d+)/delete',
  authenticate,
  validateDeleteVehicleTransaction,
  deleteTransaction,
);
export default router;
