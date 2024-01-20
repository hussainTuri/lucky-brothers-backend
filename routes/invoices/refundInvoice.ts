import { NextFunction, Request, Response } from 'express';
import { refundInvoice as refundInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';

export const refundInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await refundInvoiceRepository(Number(req.params.invoiceId));
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
