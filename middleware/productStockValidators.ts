import { Inventory, ProductStock } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createProductStockSchema } from '../lib/validators/';

const extractStockData = (payload: Partial<ProductStock>) => {
  return {
    productId: payload.productId ?? null,
    originalQuantity: payload.originalQuantity ?? null,
    pricePerItem: payload.pricePerItem ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<ProductStock>;
  const stockEntry = extractStockData(payload) as Partial<ProductStock>;
  req.body = stockEntry;
  next();
};

export const validateCreateProductStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createProductStockSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
