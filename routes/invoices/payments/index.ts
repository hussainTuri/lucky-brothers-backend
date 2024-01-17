import express, { Request, RequestHandler, Response } from 'express';
import {
  normalizeCreateData,
  validateCreateInvoicePayment,
} from '../../../middleware/invoicePaymentValidators';
import { authenticate } from '../../../middleware/authenticate';
import { createPayment } from './createPayment';

const router = express.Router();
router.post('/', authenticate, normalizeCreateData, validateCreateInvoicePayment, createPayment);

export default router;
