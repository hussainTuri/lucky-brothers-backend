import { Prisma, Product } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import { createProductSchema, updateProductSchema } from '../lib/validators/';
import { UCFirst, toNumber, trimSpaces } from '../lib/utils';

const extractProductData = (
  payload: Prisma.ProductUncheckedUpdateInput | Prisma.ProductUncheckedCreateInput,
) => {
  return {
    productName: UCFirst((payload.productName as string) ?? null),
    productTypeId: payload.productTypeId,
    sku: payload.sku ?? null,
    stockQuantity: toNumber(payload.stockQuantity, 0),
    manufacturer: UCFirst((payload.manufacturer as string) ?? null),
    manufacturingYear: toNumber(payload.manufacturingYear),
    imagePath: payload.imagePath ?? null,
    size: payload.size ?? null,
    diameter: toNumber(payload.diameter) ?? null,
    speedIndex: payload.speedIndex ?? null,
    loadIndex: payload.loadIndex ?? null,
    season: payload.season ?? null,
    width: toNumber(payload.width),
    height: toNumber(payload.height),
    length: toNumber(payload.length),
    startStop: toNumber(payload.startStop),
    design: payload.design ?? null,
    threadSize: payload.threadSize ?? null,
    buyingPrice: toNumber(payload.buyingPrice),
    sellingPrice: toNumber(payload.sellingPrice),
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Prisma.ProductCreateInput;
  const product = extractProductData(payload) as Partial<Product>;
  req.body = product;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Prisma.ProductCreateInput;
  const product = extractProductData(payload) as Partial<Product>;
  product.id = req.body.id ?? 0;
  req.body = product;
  next();
};

export const validateCreateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createProductSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateProductSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
