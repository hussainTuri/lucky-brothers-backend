import { TransportVehicleReservation } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import {
  createVehicleReservationSchema,
  updateVehicleReservationSchema,
} from '../../lib/validators/transport';
import { getReservationsByVehicleId } from '../../prisma/repositories/transport';
import { isReservationOverlapping } from '../../lib/utils';

const extractVehicleReservationData = (payload: Partial<TransportVehicleReservation>) => {
  return {
    vehicleId: payload?.vehicleId ?? null,
    customerId: payload?.customerId ?? null,
    reservationStart: payload?.reservationStart ? new Date(payload.reservationStart) : null,
    reservationEnd: payload?.reservationEnd ? new Date(payload?.reservationEnd) : null,
    monthlyRate: payload?.monthlyRate ?? null,
    comment: payload?.comment ?? null,
  };
};

export const normalizeCreateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicleReservation>;
  const vehicleEntry = extractVehicleReservationData(
    payload,
  ) as Partial<TransportVehicleReservation>;
  req.body = vehicleEntry;
  next();
};

export const normalizeUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as Partial<TransportVehicleReservation>;
  const vehicleEntry = extractVehicleReservationData(
    payload,
  ) as Partial<TransportVehicleReservation>;
  vehicleEntry.id = payload.id ?? undefined;
  req.body = vehicleEntry;
  next();
};

export const validateCreateVehicleReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = createVehicleReservationSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  // Check if it will create an overlapping reservation
  const invalid = await checkReservationPeriod(req.body as TransportVehicleReservation);
  if (invalid) {
      resp.message = 'Reservation overlaps with existing reservations';
      resp.success = false;
      return res.status(400).json(resp);
  }

  next();
};

export const validateUpdateVehicleReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const resp = response();
  const { error } = updateVehicleReservationSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    resp.message = error.details[0].message || '';
    resp.success = false;
    return res.status(400).json(resp);
  }

  // Check if it will create an overlapping reservation
  const invalid = await checkReservationPeriod(req.body as TransportVehicleReservation);
  if (invalid) {
      resp.message = 'Reservation overlaps with existing reservations';
      resp.success = false;
      return res.status(400).json(resp);
  }

  next();
};

const checkReservationPeriod = async (reservation: TransportVehicleReservation) => {
  const existingReservations = await getReservationsByVehicleId(reservation.vehicleId);
  return isReservationOverlapping(reservation, existingReservations);
};
