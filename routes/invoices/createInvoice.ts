import { NextFunction, Response } from 'express';
import { saveInvoice as saveInvoiceRepository } from '../../prisma/repositories/invoices/';
import { response } from '../../lib/response';
import { Prisma } from '@prisma/client';
import { messages } from '../../lib/constants';
import { CustomError } from '../../lib/errorHandler';
import { AuthenticatedRequest } from '../../types';
import * as Sentry from '@sentry/node';

export const createInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  req.body.createdById = req.user?.id ?? 0;

  try {
    resp.data = await saveInvoiceRepository(req.body);
  } catch (e: any) {
    console.error('DB Error', e);
    Sentry.captureException(e);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        resp.message = messages.PHONE_EXISTS; // customer phone error while also saving customer
      }
    }
    if (e instanceof CustomError) {
      resp.message = e.message;
    }
    return res.status(400).json(resp);
  }

  return res.json(resp);
};
