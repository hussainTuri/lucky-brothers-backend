import { DailyReport } from '@prisma/client';
import { Request, Response, NextFunction, query } from 'express';
import { response } from '../lib/response';
import { createDailyReportSchema } from '../lib/validators/';

const extractDailyReportData = (payload: Partial<DailyReport>) => {
  return {
    reportDate: payload.reportDate ? new Date(payload.reportDate) : null,
    openingBalance: payload.openingBalance ?? null,
    sales: payload.sales ?? null,
    expense: payload.expense ?? null,
    receiveCash: payload.receiveCash ?? null,
    payCash: payload.payCash ?? null,
    buyStock: payload.buyStock ?? null,
    closingBalance: payload.closingBalance ?? null,
    description: payload.description ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<DailyReport>;
  const monthlyReportEntry = extractDailyReportData(payload) as Partial<DailyReport>;
  req.body = monthlyReportEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<DailyReport>;
  const monthlyReportEntry = extractDailyReportData(payload) as Partial<DailyReport>;
  monthlyReportEntry.id = payload.id ?? undefined;
  req.body = monthlyReportEntry;
  next();
};

export const validateCreateDailyReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createDailyReportSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }
  next();
};
