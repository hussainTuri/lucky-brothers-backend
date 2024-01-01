import { NextFunction, Request, Response } from 'express';
import { getCustomer as getCustomerRepository } from '../../prisma/repositories/customers/';
import { response } from '../../lib/response';

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getCustomerRepository(req.params.customerId);
  return res.json(resp);
};
