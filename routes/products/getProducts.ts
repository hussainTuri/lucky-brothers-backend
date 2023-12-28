import { NextFunction, Request, Response } from 'express';
import { getProducts as getProductsRepository } from '../../prisma/repositories/products/';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  const products = await getProductsRepository();
  return res.json(products);
};
