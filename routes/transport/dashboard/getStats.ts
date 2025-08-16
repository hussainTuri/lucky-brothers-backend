import { NextFunction, Request, Response } from 'express';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import * as Sentry from '@sentry/node';
import { QueryOptions, QuerySort, SortOrder } from '../../../types';
import { getTransportMonthlyStatsDashboard as getTransportMonthlyStatsDashboardRepo } from '../../../prisma/repositories/transport';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const filters = {} as QueryOptions;
  if (req.query?.skip) filters.skip = Number(req.query.skip);
  if (req.query?.take) filters.take = Number(req.query.take);

  let sort: QuerySort | undefined;
  const sortParam = req.query?.sort as string | undefined;
  if (sortParam) {
    const [sortBy, sortOrderRaw] = sortParam.split(',');
    const sortOrder = (
      sortOrderRaw === 'asc' || sortOrderRaw === 'desc' ? sortOrderRaw : 'desc'
    ) as SortOrder;
    if (sortBy === 'month') sort = { month: sortOrder };
  }

  try {
    resp.data = await getTransportMonthlyStatsDashboardRepo(filters, sort);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
