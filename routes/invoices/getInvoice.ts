import { NextFunction, Request, Response } from 'express';
import { getInvoice as getInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getInvoiceRepository(req.params.invoiceId);
  return res.json(resp);
};
