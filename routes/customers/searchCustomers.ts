import { NextFunction, Request, Response } from 'express';
import { searchCustomers as searchCustomersRepository } from '../../prisma/repositories/customers';
import { SearchQuery } from '../../types';

export const searchCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const searchQuery: SearchQuery = {
    customerName: req.body.term ?? undefined,
    customerPhone: req.body.term ?? undefined,
    take: req.body.take ?? 1000,
  };
  const customers = await searchCustomersRepository(searchQuery);
  return res.json(customers);
};
