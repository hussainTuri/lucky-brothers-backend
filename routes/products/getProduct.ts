import { NextFunction, Request, Response } from 'express';
import { getProduct as getProductRepository } from '../../prisma/repositories/products/';

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  const products = await getProductRepository(req.params.productId);
  return res.json(products);
};
