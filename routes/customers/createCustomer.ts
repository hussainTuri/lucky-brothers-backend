import { NextFunction, Response } from 'express';
import { saveCustomer as saveCustomerRepository } from '../../prisma/repositories/customers/';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';
import { AuthenticatedRequest } from '../../types';

export const createCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  req.body.createdById = req.user?.id ?? 0;

  try {
    resp.data = await saveCustomerRepository(req.body);
  } catch (error) {
    // TODO - Add Sentry
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
