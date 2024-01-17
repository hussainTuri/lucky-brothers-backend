import { NextFunction, Request, Response } from 'express';
import { getInvoice as getInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { InvoiceIncludeOptions } from '../../types/includeOptions';

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const includeOptions: InvoiceIncludeOptions = {
    items: {
      product: true,
    },
    customer: true,
    payments: true,
  };

  try {
    resp.data = await getInvoiceRepository(req.params.invoiceId, includeOptions);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
