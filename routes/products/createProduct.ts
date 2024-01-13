import { NextFunction, Request, Response } from 'express';
import { saveProduct as saveProductRepository } from '../../prisma/repositories/products/';
import { response } from '../../lib/response';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const product = await saveProductRepository(req.body);
  if (product === null) {
    resp.success = false;
    resp.message = 'Failed to create product';
    return res.status(400).json(resp);
  }

  resp.data = product;
  return res.json(resp);
};
