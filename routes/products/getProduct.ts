import { NextFunction, Request, Response } from 'express';
import { getProduct as getProductRepository } from '../../prisma/repositories/products/';
import { response } from '../../lib/response';

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  resp.data = await getProductRepository(req.params.productId);
  return res.json(resp);
};
