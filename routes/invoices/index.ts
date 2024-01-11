import express, { Request, RequestHandler, Response } from 'express';
import { getRelatedData } from './getRelatedData';
import { getInvoice } from './getInvoice';
import { generatePdf } from './generatePdf';
import { getInvoices } from './getInvoices';
import {
  normalizeCreateData,
  validateCreateInvoice,
  validateQueryParams,
} from '../../middleware/invoiceValidators';
import { createInvoice } from './createInvoice';
import { authenticate } from '../../middleware/authenticate';

const router = express.Router();
router.post('/', authenticate, normalizeCreateData, validateCreateInvoice, createInvoice);
router.get('/related-data', authenticate, getRelatedData);
router.get('/:invoiceId', authenticate, getInvoice);
router.get('/:invoiceId/print', authenticate, generatePdf);
router.get('/', authenticate, validateQueryParams, getInvoices);
export default router;
