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

const router = express.Router();
router.post('/', normalizeCreateData, validateCreateInvoice, createInvoice);
router.get('/related-data', getRelatedData);
router.get('/:invoiceId', getInvoice);
router.get('/:invoiceId/print', generatePdf);
router.get('/', validateQueryParams, getInvoices);
export default router;
