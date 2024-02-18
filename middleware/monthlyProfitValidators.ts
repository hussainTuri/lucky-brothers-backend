import { MonthlyProfit } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createMonthlyProfitSchema } from '../lib/validators/';

const extractMonthlyProfitData = (payload: Partial<MonthlyProfit>) => {
  return {
    monthYear: payload.monthYear ?? null,
    sales: payload.sales ?? null,
    expense: payload.expense ?? null,
    profit: payload.profit ?? null,
    description: payload.description ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<MonthlyProfit>;
  const monthlyProfitEntry = extractMonthlyProfitData(payload) as Partial<MonthlyProfit>;
  req.body = monthlyProfitEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<MonthlyProfit>;
  const monthlyProfitEntry = extractMonthlyProfitData(payload) as Partial<MonthlyProfit>;
  monthlyProfitEntry.id = payload.id ?? undefined;
  req.body = monthlyProfitEntry;
  next();
};

export const validateCreateMonthlyProfit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createMonthlyProfitSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
