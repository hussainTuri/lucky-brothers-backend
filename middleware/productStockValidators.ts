import { ProductStock } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import { createProductStockSchema, updateProductStockSchema } from '../lib/validators/';

const extractStockData = (payload: Partial<ProductStock>) => {
  return {
    productId: payload.productId ?? null,
    originalQuantity: payload.originalQuantity ?? null,
    pricePerItem: payload.pricePerItem ?? null,
    comment: payload.comment ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<ProductStock>;
  const stockEntry = extractStockData(payload) as Partial<ProductStock>;
  stockEntry.remainingQuantity = payload.originalQuantity;
  req.body = stockEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<ProductStock>;
  const stockEntry = extractStockData(payload) as Partial<ProductStock>;
  stockEntry.id = payload.id ?? undefined;
  stockEntry.remainingQuantity = payload.remainingQuantity ?? undefined;
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

export const validateUpdateProductStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = updateProductStockSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
