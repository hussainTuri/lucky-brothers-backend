import { NextFunction, Request, Response } from 'express';
import { searchCustomers as searchCustomersRepository } from '../../prisma/repositories/customers';
import { SearchQuery } from '../../types';
import { response } from '../../lib/response';
import { messages } from '../../lib/constants';

export const searchCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const searchQuery: SearchQuery = {
    customerName: req.body.term ?? undefined,
    customerPhone: req.body.term ?? undefined,
    take: req.body.take ?? 1000,
  };
  try {
    resp.data = await searchCustomersRepository(searchQuery);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
