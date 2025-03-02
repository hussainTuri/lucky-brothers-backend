import { Response } from 'express';
import { response } from '../../../../lib/response';
import { deleteVehicleTransaction as deleteVehicleTransactionRepository } from '../../../../prisma/repositories/transport';
import * as Sentry from '@sentry/node';
import { messages } from '../../../../lib/constants';
import { AuthenticatedRequest } from '../../../../types';

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  const resp = response();

  try {
    resp.data = await deleteVehicleTransactionRepository(req.params.vehicleId, req.params.transactionId);
  } catch (error) {
    console.error('DB Error', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  return res.json(resp);
};
