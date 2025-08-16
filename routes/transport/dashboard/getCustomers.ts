import { NextFunction, Request, Response } from 'express';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import { QueryOptions, QuerySort, SortOrder } from '../../../types';
import * as Sentry from '@sentry/node';
import { getTransportCustomersDashboard as getTransportCustomersDashboardRepo } from '../../../prisma/repositories/transport';

export const getDashboardCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const filters = {} as QueryOptions;
  if (req.query?.skip) filters.skip = Number(req.query.skip);
  if (req.query?.take) filters.take = Number(req.query.take);
  if (req.query?.customerName) filters.customerName = String(req.query.customerName);

  // Parse sort parameter e.g. ?sort=customerName,asc|desc|dueAmount,desc
  let sort: QuerySort | undefined;
  const sortParam = req.query?.sort as string | undefined;
  if (sortParam) {
    const [sortBy, sortOrderRaw] = sortParam.split(',');
    const sortOrder = (
      sortOrderRaw === 'asc' || sortOrderRaw === 'desc' ? sortOrderRaw : 'desc'
    ) as SortOrder;

    if (sortBy === 'id') sort = { id: sortOrder };
    else if (sortBy === 'createdAt') sort = { createdAt: sortOrder };
    else if (sortBy === 'customerName') sort = { customerName: sortOrder };
    else if (sortBy === 'dueAmount') sort = { dueAmount: sortOrder };
  }

  try {
    resp.data = await getTransportCustomersDashboardRepo(filters, sort);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
