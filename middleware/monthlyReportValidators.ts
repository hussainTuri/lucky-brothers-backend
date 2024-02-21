import { MonthlyReport } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../lib/response';
import { createMonthlyReportSchema } from '../lib/validators/';

const extractMonthlyReportData = (payload: Partial<MonthlyReport>) => {
  return {
    monthYear: payload.monthYear ?? null,
    sales: payload.sales ?? null,
    expense: payload.expense ?? null,
    profit: payload.profit ?? null,
    description: payload.description ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<MonthlyReport>;
  const monthlyReportEntry = extractMonthlyReportData(payload) as Partial<MonthlyReport>;
  req.body = monthlyReportEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<MonthlyReport>;
  const monthlyReportEntry = extractMonthlyReportData(payload) as Partial<MonthlyReport>;
  monthlyReportEntry.id = payload.id ?? undefined;
  req.body = monthlyReportEntry;
  next();
};

export const validateCreateMonthlyReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createMonthlyReportSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
