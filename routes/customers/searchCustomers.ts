import { NextFunction, Request, Response } from 'express';
import { searchCustomers as searchCustomersRepository } from '../../prisma/repositories/customers';
import { SearchQuery } from '../../types';
import { response } from '../../lib/response';

export const searchCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const searchQuery: SearchQuery = {
    customerName: req.body.term ?? undefined,
    customerPhone: req.body.term ?? undefined,
    take: req.body.take ?? 1000,
  };
  resp.data = await searchCustomersRepository(searchQuery);
  return res.json(resp);
};
