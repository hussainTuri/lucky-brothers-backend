import { NextFunction, Request, Response } from 'express';
import { getProduct as getProductRepository } from '../../prisma/repositories/products/';
import { stringToNumber } from '../../lib/utils/';

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  const products = await getProductRepository(stringToNumber(req.params.productId));
  return res.json(products);
};
