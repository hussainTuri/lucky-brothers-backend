import { CashOut } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createCashOutSchema, updateCashOutSchema } from '../lib/validators/';
import { TransactionModeEnum } from '../lib/enums';

const extractCashOutData = (payload: Partial<CashOut>) => {
  return {
    amount: payload.amount ?? null,
    description: payload.description ?? null,
    cashDate: payload.cashDate ? new Date(payload.cashDate) : null,
    mode: payload.mode ?? TransactionModeEnum.Cash,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<CashOut>;
  const cashEntry = extractCashOutData(payload) as Partial<CashOut>;
  req.body = cashEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<CashOut>;
  const cashEntry = extractCashOutData(payload) as Partial<CashOut>;
  cashEntry.id = payload.id ?? undefined;
  req.body = cashEntry;
  next();
};

export const validateCreateCashOut = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = createCashOutSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};

export const validateUpdateCashOut = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const { error } = updateCashOutSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
