import { Response } from 'express';
import { response } from '../../../../lib/response';
import { deleteReservation as deleteReservationRepository } from '../../../../prisma/repositories/transport/vehicles/reservations/deleteReservation';
import { AuthenticatedRequest } from '../../../../types';
import * as Sentry from '@sentry/node';
import { messages } from '../../../../lib/constants';

export const deleteVehicleReservation = async (req: AuthenticatedRequest, res: Response) => {
  const resp = response();

  try {
    resp.data = await deleteReservationRepository(req.params.reservationId);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
