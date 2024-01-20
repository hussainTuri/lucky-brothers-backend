import express, { Request, RequestHandler, Response } from 'express';
import { getRelatedData } from './getRelatedData';
import { getInvoice } from './getInvoice';
import { generatePdf } from './generatePdf';
import { getInvoices } from './getInvoices';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateInvoice,
  validateUpdateInvoice,
  validateQueryParams,
} from '../../middleware/invoiceValidators';
import { createInvoice } from './createInvoice';
import { updateInvoice } from './updateInvoice';
import { authenticate } from '../../middleware/authenticate';
import paymentRoutes from './payments';
import { refundInvoice } from './refundInvoice';
import { cancelInvoice } from './cancelInvoice';

const router = express.Router();
router.get('/', authenticate, validateQueryParams, getInvoices);
router.post('/', authenticate, normalizeCreateData, validateCreateInvoice, createInvoice);
router.get('/:invoiceId', authenticate, getInvoice);
router.put('/:invoiceId', authenticate, normalizeUpdateData, validateUpdateInvoice, updateInvoice);

// Related data
router.get('/related-data', authenticate, getRelatedData);

// Payments
router.use('/:invoiceId/payments', paymentRoutes);

// Refund
router.put('/:invoiceId/refund', authenticate, refundInvoice);

// Cancel
router.put('/:invoiceId/cancel', authenticate, cancelInvoice);

// Generate PDF
router.get('/:invoiceId/print', authenticate, generatePdf);

export default router;
