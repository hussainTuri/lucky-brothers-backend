import { NextFunction, Request, Response } from 'express';
import { getCustomer as getCustomerRepository } from '../../prisma/repositories/customers/';

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const customers = await getCustomerRepository(req.params.customerId);
  return res.json(customers);
};
