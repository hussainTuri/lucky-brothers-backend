import { NextFunction, Request, Response } from 'express';
import { getVehicle as getVehicleRepository } from '../../../prisma/repositories/transport';
import { response } from '../../../lib/response';
import { messages } from '../../../lib/constants';
import * as Sentry from '@sentry/node';

export const getVehicle = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  try {
    resp.data = await getVehicleRepository(req.params.vehicleId);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
