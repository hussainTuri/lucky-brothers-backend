import { Cash } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createCashSchema, updateCashSchema } from '../lib/validators/';
import { TransactionModeEnum } from '../lib/enums';

const extractCashData = (payload: Partial<Cash>) => {
  return {
    amount: payload.amount ?? null,
    description: payload.description ?? null,
    cashDate: payload.cashDate ? new Date(payload.cashDate) : null,
    mode: payload.mode ?? TransactionModeEnum.Cash,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<Cash>;
  const cashEntry = extractCashData(payload) as Partial<Cash>;
  req.body = cashEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<Cash>;
  const cashEntry = extractCashData(payload) as Partial<Cash>;
  cashEntry.id = payload.id ?? undefined;
  req.body = cashEntry;
  next();
};

export const validateCreateCash = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createCashSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateCash = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateCashSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
