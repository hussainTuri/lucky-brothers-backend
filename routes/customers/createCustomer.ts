import { NextFunction, Request, Response } from 'express';
import { createCustomer as createCustomerRepository } from '../../prisma/repositories/customers/';
import { response } from '../../lib/response';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const customer = await createCustomerRepository(req.body);
  if (customer === null) {
    resp.success = false;
    resp.message = 'Failed to create customer';
    return res.status(400).json(resp);
  }

  resp.data = customer;
  return res.json(resp);
};
