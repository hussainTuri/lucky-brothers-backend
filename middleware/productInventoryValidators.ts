import { Inventory } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createProductInventorySchema } from '../lib/validators/';

const extractInventoryData = (payload: Partial<Inventory>) => {
  return {
    productId: payload.productId ?? null,
    quantity: payload.quantity ?? null,
    reason: payload.reason ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<Inventory>;
  const payment = extractInventoryData(payload) as Partial<Inventory>;
  req.body = payment;
  next();
};

export const validateCreateProductInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createProductInventorySchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
