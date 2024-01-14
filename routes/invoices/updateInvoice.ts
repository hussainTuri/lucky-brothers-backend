import { NextFunction, Request, Response } from 'express';
import { updateInvoice as updateInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  let invoice = null;

  try {
    invoice = await updateInvoiceRepository(req.body);
    if (invoice === null) {
      resp.success = false;
      resp.message = 'Failed to update invoice';
      return res.status(400).json(resp);
    }
  } catch (e: any) {
    // we will only catch error we throw explicitly
    console.log('user error ', e);

    resp.success = false;
    resp.message = e.message;
    return res.status(400).json(resp);
  }

  resp.data = invoice;
  return res.json(resp);
};
