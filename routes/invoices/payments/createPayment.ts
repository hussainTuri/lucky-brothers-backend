import { NextFunction, Request, Response } from 'express';
import { savePayment as saveInvoicePaymentRepository } from '../../../prisma/repositories/invoices/';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import * as Sentry from '@sentry/node';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await saveInvoicePaymentRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
