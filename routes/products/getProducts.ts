import { NextFunction, Request, Response } from 'express';
import { getProducts as getProductsRepository } from '../../prisma/repositories/products/';
import { response } from '../../lib/response';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getProductsRepository();
  return res.json(resp);
};
