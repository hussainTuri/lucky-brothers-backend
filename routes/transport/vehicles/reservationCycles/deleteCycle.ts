import { Response } from 'express';
import { response } from '../../../../lib/response';
import { deleteReservationCycleWithRelations as deleteReservationCycleRepository } from '../../../../prisma/repositories/transport/vehicles/reservationCycles/deleteReservationCycle';
import { AuthenticatedRequest } from '../../../../types';
import * as Sentry from '@sentry/node';
import { messages } from '../../../../lib/constants';

export const deleteReservationCycle = async (req: AuthenticatedRequest, res: Response) => {
  const resp = response();
  try {
    resp.data = await deleteReservationCycleRepository(req.params.cycleId);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
