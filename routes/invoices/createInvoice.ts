import { NextFunction, Request, Response } from 'express';
import { saveInvoice as saveInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';
import { Prisma } from '@prisma/client';
import { messages } from '../../lib/constants';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await saveInvoiceRepository(req.body);
  } catch (e: any) {
    console.error('DB Error', e);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        resp.message = messages.PHONE_EXISTS;
      }
    }
    return res.status(400).json(resp);
  }

  return res.json(resp);
};
