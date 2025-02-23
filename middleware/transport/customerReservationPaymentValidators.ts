import { CustomerReservationPayment } from '../../types';
import _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import { createCustomerReservationPaymentsSchema } from '../../lib/validators/transport/customerCreateSchema';
import { getReservationCyclesDueAmounts } from '../../prisma/repositories/transport/vehicles/reservationCycles/common';
import * as Sentry from '@sentry/node';
import { messages } from '../../lib/constants';

const extractCustomerReservationPaymentData = (payload: CustomerReservationPayment[]) => {
  if (_.isEmpty(payload)) {
    return [];
  }

  return payload.map((entry) => {
    return {
      customerId: entry?.customerId ?? null,
      vehicleId: entry?.vehicleId ?? null,
      reservationCycleId: entry?.reservationCycleId ?? null,
      customerTransactionTypeId: entry?.customerTransactionTypeId ?? null,
      amount: entry?.amount ? Math.abs(entry.amount) : null,
    };
  });
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CustomerReservationPayment[];
  const entry = extractCustomerReservationPaymentData(payload);
  req.body = entry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CustomerReservationPayment[];
  const entry = extractCustomerReservationPaymentData(payload);
  req.body = entry;
  next();
};

export const validateCreateCustomerReservationPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createCustomerReservationPaymentsSchema.validate(req.body, {
    allowUnknown: true,
  });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  // Cross check  payment reservation due amount, error if more than due amount.
  try {
    const reservationCycles = await getReservationCyclesDueAmounts(
      req.body.map((entry: CustomerReservationPayment) => entry.reservationCycleId),
    );

    // req?.body?.forEach((entry: CustomerReservationPayment) => {
    for (const entry of req.body) {
      const cycle = reservationCycles.find((cycle) => cycle.id === entry.reservationCycleId);

      if (!cycle) {
        resp.message = 'Invalid reservation cycle';
        resp.success = false;
        Sentry.captureException(new Error(resp.message), {
          extra: { reservationCycleId: entry.reservationCycleId, payload: req.body },
        });
        return res.status(400).json(resp);
      }

      if (entry.amount > cycle.dueAmount) {
        resp.message = 'Payment amount is more than due amount';
        resp.success = false;
        Sentry.captureException(new Error(resp.message), {
          extra: {
            reservationCycleId: entry.reservationCycleId,
            Amount: entry.amount,
            dueAmount: cycle.dueAmount,
          },
        });
        return res.status(400).json(resp);
      }
    }
  } catch (error) {
    console.error('Error in validator: ', error);
    Sentry.captureException(error);
    resp.success = false;
    resp.message = messages.INTERNAL_SERVER_ERROR;
    return res.status(500).json(resp);
  }

  next();
};

//
