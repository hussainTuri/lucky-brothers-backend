import { Response } from 'express';
import { updateVehicleReservation as updateVehicleReservationRepository } from '../../../../prisma/repositories/transport';
import { response } from '../../../../lib/response';
import { messages } from '../../../../lib/constants';
import { AuthenticatedRequest } from '../../../../types';
import * as Sentry from '@sentry/node';

export const updateVehicleReservation = async (req: AuthenticatedRequest, res: Response) => {
  const resp = response();
  console.log('req.params---------->', req.params);
  req.body.updatedById = req.user?.id ?? 0;

  try {
    resp.data = await updateVehicleReservationRepository(req.body);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
