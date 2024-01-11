import { NextFunction, Request, Response } from 'express';
import { updateCustomer as updateCustomerRepository } from '../../prisma/repositories/customers/';
import { response } from '../../lib/response';

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const customer = await updateCustomerRepository(req.body);
  if (customer === null) {
    resp.success = false;
    resp.message = 'Failed to update customer';
    return res.status(400).json(resp);
  }

  resp.data = customer;
  return res.json(resp);
};
