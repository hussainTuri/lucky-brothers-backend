import { NextFunction, Request, Response } from 'express';
import { getCustomer as getCustomerRepository } from '../../../prisma/repositories/transport';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import * as Sentry from '@sentry/node';

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    const customer = await getCustomerRepository(req.params.customerId);

    resp.data = { customer };
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
