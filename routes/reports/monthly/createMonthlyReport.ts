import { NextFunction, Request, Response } from 'express';
import { saveMonthlyReport as saveMonthlyReportRepository } from '../../../prisma/repositories/reports/monthly';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';

export const createMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await saveMonthlyReportRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
