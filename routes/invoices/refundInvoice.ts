import { NextFunction, Response } from 'express';
import { refundInvoice as refundInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';
import * as Sentry from '@sentry/node';

export const refundInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();

  try {
    resp.data = await refundInvoiceRepository(Number(req.params.invoiceId), req.user?.id ?? 0);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
