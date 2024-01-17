import { NextFunction, Request, Response } from 'express';
import { saveCustomer as saveCustomerRepository } from '../../prisma/repositories/customers/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await saveCustomerRepository(req.body);
  } catch (error) {
    // TDOO - Add Sentry
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
