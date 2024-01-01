import { NextFunction, Request, Response } from 'express';
import { getCustomers as getCustomersRepository } from '../../prisma/repositories/customers';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const customers = await getCustomersRepository();
  return res.json(customers);
};
