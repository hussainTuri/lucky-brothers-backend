import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import { createCustomerSchema, updateCustomerSchema } from '../lib/validators/';
import { Customer } from '@prisma/client';
import { UCFirstLCRest, trimSpaces } from '../lib/utils';

export const extractCustomerData = (
  payload: Prisma.CustomerUncheckedUpdateInput | Prisma.CustomerUncheckedCreateInput,
) => {
  return {
    customerName: UCFirstLCRest((payload.customerName as string) ?? null),
    trn: payload.trn ?? null,
    phone: trimSpaces((payload.phone as string) ?? null),
    address: payload.address ?? null,
    imagePath: payload.imagePath ?? null,
  };
};

export const normalizeCreateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Prisma.CustomerCreateInput;
  const customer = extractCustomerData(payload) as Partial<Customer>;
  req.body = customer;
  next();
};

export const normalizeUpdateData = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Prisma.CustomerCreateInput;
  const customer = extractCustomerData(payload) as Partial<Customer>;
  customer.id = req.body.id ?? 0;
  req.body = customer;
  next();
};

export const validateCreateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createCustomerSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateCustomerSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const cleanSearchInput = async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.term) {
    req.body.term = req.body.term.trim();
  }
  next();
};
