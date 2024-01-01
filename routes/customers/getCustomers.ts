import { NextFunction, Request, Response } from 'express';
import { getCustomers as getCustomersRepository } from '../../prisma/repositories/customers';
import { response } from '../../lib/response';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getCustomersRepository();
  return res.json(resp);
};
