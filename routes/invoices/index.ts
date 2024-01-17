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

const router = express.Router();
router.post('/', authenticate, normalizeCreateData, validateCreateInvoice, createInvoice);
router.get('/related-data', authenticate, getRelatedData);
router.get('/:invoiceId', authenticate, getInvoice);
router.put('/:invoiceId', authenticate, normalizeUpdateData, validateUpdateInvoice, updateInvoice);
router.get('/:invoiceId/print', authenticate, generatePdf);
router.get('/', authenticate, validateQueryParams, getInvoices);
router.use('/:invoiceId/payments', paymentRoutes);
export default router;
