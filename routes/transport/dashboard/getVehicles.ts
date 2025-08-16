import { NextFunction, Request, Response } from 'express';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import * as Sentry from '@sentry/node';
import { QueryOptions, QuerySort } from '../../../types';
import { getTransportVehiclesDashboard as getTransportVehiclesDashboardRepo } from '../../../prisma/repositories/transport';

export const getDashboardVehicles = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();
  const filters = {} as QueryOptions;
  if (req.query?.skip) filters.skip = Number(req.query.skip);
  if (req.query?.take) filters.take = Number(req.query.take);

  try {
    resp.data = await getTransportVehiclesDashboardRepo(filters);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
