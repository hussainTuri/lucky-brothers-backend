import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateCustomerReservationPayments,
} from '../../../../middleware/transport/customerReservationPaymentValidators';
import { createCustomerReservationPayments } from './createPayments';

const router = express.Router();

router.post(
  '/:reservationId(\\d+)/payments',
  authenticate,
  normalizeCreateData,
  validateCreateCustomerReservationPayments,
  createCustomerReservationPayments,
);

export default router;
