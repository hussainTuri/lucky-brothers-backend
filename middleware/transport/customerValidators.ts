import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import {
  createTransportCustomerSchema,
  updateTransportCustomerSchema,
} from '../../lib/validators/transport';
import { TransportCustomer } from '@prisma/client';

const extractTransportCustomerData = (payload: Partial<TransportCustomer>) => {
  return {
    customerName: payload?.customerName ?? null,
    contact1: payload?.contact1 ?? null,
    contact1Phone: payload?.contact1Phone ?? null,
    contact2: payload.contact2 ?? null,
    contact2Phone: payload?.contact2Phone ?? null,
    phone: payload?.phone ?? null,
    address: payload?.address ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportCustomer>;
  const customerEntry = extractTransportCustomerData(payload) as Partial<TransportCustomer>;
  req.body = customerEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportCustomer>;
  const customerEntry = extractTransportCustomerData(payload) as Partial<TransportCustomer>;
  customerEntry.id = payload.id ?? undefined;

  req.body = customerEntry;
  next();
};

export const cleanTransportCustomerSearchInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.term) {
    req.body.term = req.body.term.trim();
  }
  next();
};

export const validateCreateTransportCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createTransportCustomerSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateTransportCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = updateTransportCustomerSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
