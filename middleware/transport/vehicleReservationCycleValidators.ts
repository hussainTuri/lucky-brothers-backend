import { TransportVehicleReservationRentalCycle } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import {
  createVehicleReservationCycleSchema,
  updateVehicleReservationCycleSchema,
} from '../../lib/validators/transport';
import { messages } from '../../lib/constants';
import {
  checkIfReservationCycleByMonthExists,
  getReservationCycle,
  getReservationCyclePaidAmount,
} from '../../prisma/repositories/transport/vehicles/reservationCycles';

const extractReservationCycleData = (payload: Partial<TransportVehicleReservationRentalCycle>) => {
  return {
    vehicleReservationId: payload?.vehicleReservationId ?? null,
    customerId: payload?.customerId ?? null,
    rentFrom: payload?.rentFrom ? new Date(payload.rentFrom) : null,
    rentTo: payload?.rentTo ? new Date(payload?.rentTo) : null,
    amount: payload?.amount ? Math.abs(payload.amount) : null,
    comment: payload?.comment ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicleReservationRentalCycle>;
  const entry = extractReservationCycleData(
    payload,
  ) as Partial<TransportVehicleReservationRentalCycle>;
  req.body = entry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicleReservationRentalCycle>;
  const vehicleEntry = extractReservationCycleData(
    payload,
  ) as Partial<TransportVehicleReservationRentalCycle>;
  vehicleEntry.id = payload.id ?? undefined;
  req.body = vehicleEntry;
  next();
};

export const validateCreateReservationCycle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createVehicleReservationCycleSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  // rentFrom and rentTo should be in the same month
  if (req.body.rentFrom.getMonth() !== req.body.rentTo.getMonth()) {
    resp.message = messages.RESERVATION_CYCLE_DATES_SHOULD_BE_IN_SAME_MONTH;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // If a cycle for this month already exists, Ask the user to check the existing one and update it instead of creating a new one.
  const exists = await checkIfReservationCycleByMonthExists(
    req.body.vehicleReservationId,
    req.body.rentFrom,
  );
  if (exists) {
    resp.message = messages.RESERVATION_CYCLE_ANOTHER_CYCLE_EXISTS_FOR_THIS_MONTH_UPDATE_INSTEAD;
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};

export const validateUpdateReservationCycle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = updateVehicleReservationCycleSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  // Check if it paid amount is greater than amount, then return error
  const paidAmount = await getReservationCyclePaidAmount(req.body.id);
  if (paidAmount > req.body.amount) {
    resp.message = messages.RESERVATION_CYCLE_AMOUNT_ERROR;
    resp.success = false;
    return res.status(400).json(resp);
  }
  if (paidAmount === req.body.amount) {
    resp.message = messages.RESERVATION_CYCLE_AMOUNT_FULLY_PAID;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // Check that start and end dates are in the same month as before. This check also
  // covers the case where user choose one month for start date but another month for end date.
  const cycle = await getReservationCycle(req.body.id);
  if (
    cycle.rentFrom.getMonth() !== req.body.rentFrom.getMonth() ||
    cycle.rentTo.getMonth() !== req.body.rentTo.getMonth()
  ) {
    resp.message = messages.RESERVATION_CYCLE_DATES_SHOULD_BE_IN_SAME_MONTH_AS_BEFORE;
    resp.success = false;
    return res.status(400).json(resp);
  }

  next();
};

export const validateDeleteReservationCycle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();

  const cycleId = Number(req.params.cycleId);
  if (!cycleId) {
    resp.message = messages.RESERVATION_CYCLE_ID_REQUIRED;
    resp.success = false;
    return res.status(400).json(resp);
  }

  // make sure that there is no paid amount for this cycle.
  try {
    const paidAmount = await getReservationCyclePaidAmount(req.params.cycleId);
    if (paidAmount > 0) {
      resp.message = messages.RESERVATION_CYCLE_DELETION_NOT_ALLOWED;
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
