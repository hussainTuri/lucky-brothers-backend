import { TransportVehicleTransaction } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import {
  createVehicleTransactionSchema,
  updateVehicleTransactionSchema,
} from '../../lib/validators/transport';
import { messages } from '../../lib/constants';
import { getVehicleTransaction } from '../../prisma/repositories/transport/vehicles/transactions/common';
import { TransportVehicleTransactionTypes } from '../../lib/enums/transportVehicle';

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

  // I think you should not be able to delete a transaction of type `Customer payment`. Instead, if user deletes the customer payment record from customer page,
  // then this transaction should also be deleted. Remember that transaction of type `Customer payment` are created when a customer makes payment
  // for a vehicle reservation in customer page.
  try {
    const transaction = await getVehicleTransaction(transactionId);
    if (!transaction) {
      resp.message = messages.VEHICLE_TRANSACTION_NOT_FOUND;
      resp.success = false;
      return res.status(404).json(resp);
    }

    if (TransportVehicleTransactionTypes.CustomerPayment === transaction.transactionTypeId) {
      resp.message = messages.VEHICLE_TRANSACTION_OF_TYPE_CUSTOMER_PAYMENT_DELETE_NOT_ALLOWED;
      resp.success = false;
      return res.status(400).json(resp);
    }
  } catch (error) {
    console.error('DB Error', error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  next();
};
