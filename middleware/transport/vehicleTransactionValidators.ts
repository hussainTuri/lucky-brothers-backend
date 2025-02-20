import {
  TransportVehicleReservationRentalCycle,
  TransportVehicleTransaction,
} from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import {
  createVehicleTransactionSchema,
  updateVehicleTransactionSchema,
} from '../../lib/validators/transport';
import { messages } from '../../lib/constants';

const extractVehicleTransactionData = (payload: Partial<TransportVehicleTransaction>) => {
  return {
    vehicleId: payload?.vehicleId ?? null,
    transactionTypeId: payload?.transactionTypeId ?? null,
    bankId: payload?.bankId ?? null,
    amount: payload?.amount ?? null,
    balance: payload?.balance ?? null,
    comment: payload?.comment ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicleTransaction>;
  const entry = extractVehicleTransactionData(payload) as Partial<TransportVehicleTransaction>;
  req.body = entry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicleTransaction>;
  const vehicleEntry = extractVehicleTransactionData(
    payload,
  ) as Partial<TransportVehicleTransaction>;
  vehicleEntry.id = payload.id ?? undefined;
  req.body = vehicleEntry;
  next();
};

export const validateCreateVehicleTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createVehicleTransactionSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};

export const validateUpdateVehicleTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = updateVehicleTransactionSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};

export const validateDeleteVehicleTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();

  const transactionId = Number(req.params.transactionId);
  if (!transactionId) {
    resp.message = messages.VEHICLE_TRANSACTION_ID_REQUIRED;
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};
