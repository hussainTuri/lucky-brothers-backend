import express, { Request, RequestHandler, Response } from 'express';
import { getRelatedData } from './getRelatedData';
import { getInvoice } from './getInvoice';
import { generatePdf } from './generatePdf';
import { getInvoices } from './getInvoices';
import { validateQueryParams } from '../../middleware/invoiceValidators';

const router = express.Router();
router.get('/related-data', getRelatedData);
router.get('/:invoiceId', getInvoice);
router.get('/:invoiceId/print', generatePdf);
router.get('/', validateQueryParams, getInvoices);
export default router;
