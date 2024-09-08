import { NextFunction, Request, Response } from 'express';
import { getDailyReports as getDailyReportsRepository } from '../../../prisma/repositories/reports/daily';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import { QueryOptions, QuerySort, SortOrder } from '../../../types';
import * as Sentry from '@sentry/node';

export const getDailyReports = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const filters = {} as QueryOptions;
  if (req.query?.skip) {
    filters.skip = Number(req.query.skip);
  }
  if (req.query?.take) {
    filters.take = Number(req.query.take);
  }
  const sort = {} as QuerySort;
  const sortParam = req.query?.sort as string;
  if (sortParam) {
    const [sortField, sortOrder] = sortParam.split(',');
    sort[sortField as keyof QuerySort] = sortOrder as SortOrder;
  }

  try {
    resp.data = (await getDailyReportsRepository(filters, sort)) ?? [];
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }
  return res.json(resp);
};
