import { TransportVehicleReservation } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { response } from '../../lib/response';
import {
  createVehicleReservationSchema,
  updateVehicleReservationSchema,
} from '../../lib/validators/transport';

const extractVehicleReservationData = (payload: Partial<TransportVehicleReservation>) => {
  return {
    vehicleId: payload?.vehicleId ?? null,
    customerId: payload?.customerId ?? null,
    reservationStart: payload?.reservationStart ? new Date(payload.reservationStart) :  null,
    reservationEnd: payload?.reservationEnd ? new Date(payload?.reservationEnd) :  null,
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
  console.log('payload', vehicleEntry);

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
  next();
};
